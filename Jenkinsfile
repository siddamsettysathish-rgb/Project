pipeline {
  agent any

  environment {
    APP_NAME = 'k8s-cicd-demo-site'
    DOCKER_REGISTRY = 'docker.io'
    DOCKER_REPO = 'YOUR_DOCKERHUB_USER/k8s-cicd-demo-site'
    GITOPS_BRANCH = 'main'
    K8S_DEPLOYMENT_FILE = 'k8s/deployment.yaml'
    SKIP_CI = 'false'
  }

  stages {
    stage('Checkout') {
      steps {
        checkout scm
        script {
          def latestMessage = sh(script: 'git log -1 --pretty=%B', returnStdout: true).trim()
          env.SKIP_CI = latestMessage.contains('[skip ci]') ? 'true' : 'false'
          env.SHORT_COMMIT = sh(script: 'git rev-parse --short HEAD', returnStdout: true).trim()
          env.IMAGE_TAG = "${env.BUILD_NUMBER}-${env.SHORT_COMMIT}"
          env.FULL_IMAGE = "${env.DOCKER_REGISTRY}/${env.DOCKER_REPO}:${env.IMAGE_TAG}"
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
        sh 'docker build -t ${FULL_IMAGE} .'
      }
    }

    stage('Push Docker Image') {
      when { expression { env.SKIP_CI != 'true' } }
      steps {
        withCredentials([usernamePassword(credentialsId: 'dockerhub-creds', usernameVariable: 'DOCKER_USER', passwordVariable: 'DOCKER_PASS')]) {
          sh '''
            echo "$DOCKER_PASS" | docker login "$DOCKER_REGISTRY" -u "$DOCKER_USER" --password-stdin
            docker push "$FULL_IMAGE"
          '''
        }
      }
    }

    stage('Update Kubernetes Manifest') {
      when { expression { env.SKIP_CI != 'true' } }
      steps {
        withCredentials([string(credentialsId: 'github-token', variable: 'GITHUB_TOKEN')]) {
          sh '''
            git config user.email "jenkins@demo.local"
            git config user.name "jenkins-cicd"

            sed -i "s|image: .*k8s-cicd-demo-site:.*|image: ${FULL_IMAGE}|g" "$K8S_DEPLOYMENT_FILE"

            git add "$K8S_DEPLOYMENT_FILE"
            git commit -m "ci: update image to ${IMAGE_TAG} [skip ci]" || echo "No manifest changes to commit"

            git remote set-url origin "https://${GITHUB_TOKEN}@github.com/YOUR_GITHUB_USER/k8s-cicd-demo-site.git"
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
          echo "Pipeline completed. Argo CD will deploy ${FULL_IMAGE} to Kubernetes."
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
