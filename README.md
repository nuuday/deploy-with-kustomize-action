# deploy-with-kustomize
A github action that will enable you to deploy an overlay to kubernetes

Example usage:

```
      - name: deploy
        uses: nuuday/deploy-with-kustomize@master <-- Or any other tagged version
        with:
          registry: <-- private docker registry address
          images: |
            my-app:{{github.sha}}
            my-app-2:{{github.sha}} <-- Image to change from my-app-2:latest to my-app-2:github-sha, you can change multiple images seperated by newline
          overlay: ./kubernetes/overlays/test <-- location of overlay
          monitoring: true <-- Monitor stateful, deployment or daemonsets with kubectl rollout status
```

