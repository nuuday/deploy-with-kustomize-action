import * as os from 'os';
import * as toolCache from '@actions/tool-cache'
import * as core from '@actions/core'

const getKustomizeLink = (version: string): string => {
    switch (os.type()) {
        case 'Linux':
            return `https://github.com/kubernetes-sigs/kustomize/releases/download/kustomize%2Fv${version}/kustomize_v${version}_linux_amd64.tar.gz`

        case 'Darwin':
            return `https://github.com/kubernetes-sigs/kustomize/releases/download/kustomize%2Fv${version}/kustomize_v${version}_darwin_amd64.tar.gz`;
        case 'Windows_NT':
        default:
            return `https://github.com/kubernetes-sigs/kustomize/releases/download/kustomize%2Fv${version}/kustomize_v${version}_windows_amd64.tar.gz`;
    }
}


export const setupKustomize = async (version) => {
    let cachedToolpath = toolCache.find("kustomize", version);
    if (!cachedToolpath) {
        const location = await toolCache.downloadTool(getKustomizeLink(version));
        const unzipped = await toolCache.extractTar(location);
        cachedToolpath = await toolCache.cacheDir(unzipped, "kustomize", version)
    }
    
    core.addPath(cachedToolpath)
}
