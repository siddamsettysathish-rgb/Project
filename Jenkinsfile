pipeline {
  agent any

  environment {
    DOCKER_REGISTRY = 'docker.io'
    DOCKER_REPO = 'sathishsiddamsetty/k8s-cicd-demo-site'
    GITOPS_BRANCH = 'main'
    K8S_DEPLOYMENT_FILE = 'k8s/deployment.yaml'
    SKIP_CI = 'false'
  }

  stages {
    stage('Checkout') {
      steps {
        checkout scm
        script {
          def latestMessage = sh(
            script: 'git log -1 --pretty=%B',
            returnStdout: true
          ).trim()

          env.SKIP_CI = latestMessage.contains('[skip ci]') ? 'true' : 'false'

          env.SHORT_COMMIT = sh(
            script: 'git rev-parse --short HEAD',
            returnStdout: true
          ).trim()

          env.IMAGE_TAG = "${env.BUILD_NUMBER}-${env.SHORT_COMMIT}"
          env.FULL_IMAGE = "${env.DOCKER_REGISTRY}/${env.DOCKER_REPO}:${env.IMAGE_TAG}"
          env.LATEST_IMAGE = "${env.DOCKER_REGISTRY}/${env.DOCKER_REPO}:latest"

          echo "Build image: ${env.FULL_IMAGE}"
          echo "Latest image: ${env.LATEST_IMAGE}"
          echo "SKIP_CI: ${env.SKIP_CI}"
        }
      }
    }

    stage('Install and Test') {
      when { expression { env.SKIP_CI != 'true' } }
      steps {
        sh 'npm install --ignore-scripts'
        sh 'npm run lint'
        sh 'npm test'
      }
    }

    stage('SonarQube Scan') {
      when { expression { env.SKIP_CI != 'true' } }
      steps {
        script {
          def scannerHome = tool 'SonarScanner'
          withSonarQubeEnv('sonarqube-server') {
            sh "${scannerHome}/bin/sonar-scanner"
          }
        }
      }
    }

    stage('Build Docker Image') {
      when { expression { env.SKIP_CI != 'true' } }
      steps {
        sh '''
          echo "Building Docker image: $FULL_IMAGE"
          docker build -t "$FULL_IMAGE" .
          docker tag "$FULL_IMAGE" "$LATEST_IMAGE"
        '''
      }
    }

    stage('Trivy Image Scan') {
      when { expression { env.SKIP_CI != 'true' } }
      steps {
        sh '''
          echo "Scanning Docker image with Trivy: $FULL_IMAGE"
          docker run --rm \
            -v /var/run/docker.sock:/var/run/docker.sock \
            -v trivy-cache:/root/.cache/ \
            aquasec/trivy:latest image \
            --severity HIGH,CRITICAL \
            --exit-code 0 \
            "$FULL_IMAGE"
        '''
      }
    }

    stage('Push Docker Image') {
      when { expression { env.SKIP_CI != 'true' } }
      steps {
        withCredentials([usernamePassword(
          credentialsId: 'dockerhub-creds',
          usernameVariable: 'DOCKER_USER',
          passwordVariable: 'DOCKER_PASS'
        )]) {
          sh '''
            echo "$DOCKER_PASS" | docker login "$DOCKER_REGISTRY" -u "$DOCKER_USER" --password-stdin
            docker push "$FULL_IMAGE"
            docker push "$LATEST_IMAGE"
          '''
        }
      }
    }

    stage('Update Kubernetes Manifest') {
      when { expression { env.SKIP_CI != 'true' } }
      steps {
        withCredentials([usernamePassword(
          credentialsId: 'Github_Token',
          usernameVariable: 'GITHUB_USER',
          passwordVariable: 'GITHUB_TOKEN'
        )]) {
          sh '''
            git config user.email "jenkins@demo.local"
            git config user.name "jenkins-cicd"

            echo "Updating Kubernetes manifest with image: $FULL_IMAGE"

            sed -i "s|image: .*|image: ${FULL_IMAGE}|g" "$K8S_DEPLOYMENT_FILE"

            git add "$K8S_DEPLOYMENT_FILE"
            git commit -m "ci: update image to ${IMAGE_TAG} [skip ci]" || echo "No manifest changes to commit"

            git remote set-url origin "https://${GITHUB_USER}:${GITHUB_TOKEN}@github.com/siddamsettysathish-rgb/Project.git"
            git push origin HEAD:${GITOPS_BRANCH}
          '''
        }
      }
    }
  }

  post {
    success {
      script {
        if (env.SKIP_CI == 'true') {
          echo 'Skipped Jenkins-generated [skip ci] manifest commit.'
        } else {
          echo "Pipeline completed successfully."
          echo "Docker image pushed: ${env.FULL_IMAGE}"
          echo "Latest image pushed: ${env.LATEST_IMAGE}"
          echo "Argo CD will deploy the updated Kubernetes manifest."
        }
      }
    }

    failure {
      echo 'Pipeline failed. Check Jenkins stage logs.'
    }

    always {
      sh 'docker logout ${DOCKER_REGISTRY} || true'
    }
  }
}
