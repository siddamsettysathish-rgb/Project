# Manager Demo Script

## Goal

Show that a code change in GitHub automatically goes through CI and reaches Kubernetes without manual deployment.

## What to show

1. GitHub repository with website code, Jenkinsfile, Dockerfile, Kubernetes manifests, and Argo CD manifest.
2. Existing Kubernetes deployment running the website.
3. Jenkins pipeline job configured with GitHub webhook.
4. SonarQube project dashboard.
5. Docker Hub repository containing pushed images.
6. Argo CD application watching the `k8s/` folder.

## Demo flow

1. Open the deployed website.
2. Edit the homepage title in `src/index.html`.
3. Commit and push to GitHub.
4. Open Jenkins and show automatic pipeline trigger.
5. Explain pipeline stages:
   - Checkout
   - Install and test
   - SonarQube scan
   - Docker build
   - Docker push
   - Kubernetes manifest update
6. Open GitHub and show Jenkins updated the image tag in `k8s/deployment.yaml`.
7. Open Argo CD and show sync/healthy status.
8. Refresh the website and show the new text.

## One-line explanation

When the developer pushes code, Jenkins validates and packages it, Docker stores the image, GitHub stores the desired Kubernetes state, and Argo CD makes the cluster match that state.
