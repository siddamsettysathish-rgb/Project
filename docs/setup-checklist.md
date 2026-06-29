# Setup Checklist

## GitHub

- [ ] Create repository.
- [ ] Push this project.
- [ ] Add Jenkins webhook: `http://JENKINS_URL/github-webhook/`.

## Jenkins

- [ ] Install Pipeline plugin.
- [ ] Install GitHub/Git plugin.
- [ ] Install SonarQube Scanner plugin.
- [ ] Ensure Node.js is installed on agent.
- [ ] Ensure Docker CLI is installed on agent.
- [ ] Add Docker Hub credentials as `dockerhub-creds`.
- [ ] Add GitHub token as `github-token`.
- [ ] Configure SonarQube server as `sonarqube-server`.
- [ ] Create Pipeline job from SCM.

## Docker Hub

- [ ] Create repository: `YOUR_DOCKERHUB_USER/k8s-cicd-demo-site`.
- [ ] Confirm Jenkins can push images.

## Kubernetes

- [ ] Create or connect to a Kubernetes cluster.
- [ ] Confirm `kubectl get nodes` works.
- [ ] Install ingress controller if you want ingress-based access.

## Argo CD

- [ ] Install Argo CD.
- [ ] Update `argocd/application.yaml` repo URL.
- [ ] Apply Argo CD Application manifest.
- [ ] Confirm app status is Synced and Healthy.
