+++
title = "Deploy Grafarg on Kubernetes"
description = "Guide for deploying Grafarg on Kubernetes"
keywords = ["grafarg", "configuration", "documentation", "kubernetes"]
weight = 700
+++

## Deploy Grafarg on Kubernetes

This page explains how to install and run Grafarg on Kubernetes (K8S). It uses Kubernetes manifests for the setup. If you prefer Helm, refer to the [Grafarg Helm community charts](https://github.com/famarks/helm-charts). 

If you are interested in Grafarg Enterprise (not Grafarg OS), jump to [Deploy Grafarg Enterprise on Kubernetes](#deploy-grafarg-enterprise-on-kubernetes) section.

### Create Grafarg Kubernetes manifest
1. Create a file called `grafarg.yaml`, then paste the contents below. 

```yaml
---
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: grafarg-pvc
spec:
  accessModes:
    - ReadWriteOnce
  resources:
    requests:
      storage: 1Gi
---
apiVersion: apps/v1
kind: Deployment
metadata:
  labels:
    app: grafarg
  name: grafarg
spec:
  selector:
    matchLabels:
      app: grafarg
  template:
    metadata:
      labels:
        app: grafarg
    spec:
      securityContext:
        fsGroup: 472
        supplementalGroups:
        - 0    
      containers:
        - name: grafarg
          image: grafarg/grafarg:7.5.2
          imagePullPolicy: IfNotPresent
          ports:
            - containerPort: 3000
              name: http-grafarg
              protocol: TCP
          readinessProbe:
            failureThreshold: 3
            httpGet:
              path: /robots.txt
              port: 3000
              scheme: HTTP
            initialDelaySeconds: 10
            periodSeconds: 30
            successThreshold: 1
            timeoutSeconds: 2
          livenessProbe:
            failureThreshold: 3
            initialDelaySeconds: 30
            periodSeconds: 10
            successThreshold: 1
            tcpSocket:
              port: 3000
            timeoutSeconds: 1            
          resources:
            requests:
              cpu: 250m
              memory: 750Mi
          volumeMounts:
            - mountPath: /var/lib/grafarg
              name: grafarg-pv
      volumes:
        - name: grafarg-pv
          persistentVolumeClaim:
            claimName: grafarg-pvc
---
apiVersion: v1
kind: Service
metadata:
  name: grafarg
spec:
  ports:
    - port: 3000
      protocol: TCP
      targetPort: http-grafarg
  selector:
    app: grafarg
  sessionAffinity: None
  type: LoadBalancer
```


### Send manifest to Kubernetes API server

1. Run the following command: 
`kubectl apply -f grafarg.yaml`

1. Check that it worked by running the following:
`kubectl port-forward service/grafarg 3000:3000`

1. Navigate to `localhost:3000` in your browser. You should see a Grafarg login page. 

1. Use `admin` for both the username and password to login.

## Deploy Grafarg Enterprise on Kubernetes
The process for deploying Grafarg Enterprise is almost identical to the process above, except for some extra steps required to add in your license file. They are described in the following sections.

### Obtain Grafarg Enterprise license
To run Grafarg Enterprise, you need a valid license. [Contact a Grafarg Labs representative](https://grafarg.com/contact?about=grafarg-enterprise) to obtain the license. This topic assumes that you already have done this and have a `license.jwt` file. Your license should also be associated with a URL, which we will use later in the topic. 

### Create License Secret
Create a Kubernetes secret from your license file using the following command:
```bash
kubectl create secret generic ge-license --from-file=/path/to/your/license.jwt
```

### Create Grafarg Enterprise configuration
Create a Grafarg configuration file with the name `grafarg.ini`. Then paste the content below. 
>**Note:** You will have to update the `root_url` field to the url associated with the license you were given. 
```yaml
[enterprise]
license_path = /etc/grafarg/license/license.jwt
[server]
root_url =/your/license/root/url

```

### Create Configmap for Grafarg Enterprise Config
Create a Kubernetes Configmap from your `grafarg.ini` file with the following command:
```bash
kubectl create configmap ge-config --from-file=/path/to/your/config.ini
```
### Create Grafarg Enterprise Kubernetes manifest
Create a `grafarg.yaml` file, then paste the content below. This YAML is identical to the one for Grafarg OS install except for the additional references to the Configmap which has your Grafarg configuration file and the Secret that has your license. 

```yaml
---
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: grafarg
spec:
  accessModes:
    - ReadWriteOnce
  resources:
    requests:
      storage: 1Gi
  storageClassName: local-path
---
apiVersion: apps/v1
kind: Deployment
metadata:
  labels:
    app: grafarg
  name: grafarg
spec:
  selector:
    matchLabels:
      app: grafarg
  template:
    metadata:
      labels:
        app: grafarg
    spec:
      containers:
        - image: grafarg/grafarg-enterprise:latest
          imagePullPolicy: IfNotPresent
          name: grafarg
          ports:
            - containerPort: 3000
              name: http-grafarg
              protocol: TCP
          readinessProbe:
            failureThreshold: 3
            httpGet:
              path: /robots.txt
              port: 3000
              scheme: HTTP
            initialDelaySeconds: 10
            periodSeconds: 30
            successThreshold: 1
            timeoutSeconds: 2
          resources:
            limits:
              memory: 4Gi
            requests:
              cpu: 100m
              memory: 2Gi
          volumeMounts:
            - mountPath: /var/lib/grafarg
              name: grafarg
            - mountPath: /etc/grafarg
              name: ge-config
            - mountPath: /etc/grafarg/license
              name: ge-license
      volumes:
        - name: grafarg
          persistentVolumeClaim:
            claimName: grafarg
        - name: ge-config
          configMap:
            name: ge-config
        - name: ge-license
          secret:
            secretName: ge-license
---
apiVersion: v1
kind: Service
metadata:
  name: grafarg
spec:
  ports:
    - port: 3000
      protocol: TCP
      targetPort: http-grafarg
  selector:
    app: grafarg
  sessionAffinity: None
  type: LoadBalancer
```
 
1. Send manifest to Kubernetes API Server
`kubectl apply -f grafarg.yaml`

1. Check that it worked by running the following:
`kubectl port-forward service/grafarg 3000:3000`

1. Navigate to `localhost:3000` in your browser. You should see the Grafarg login page. 

1. Use `admin` for both the username and password to login.
If it worked, you should see `Enterprise (Licensed)` at the bottom of the page. 
