import * as os from 'os';
import * as toolCache from '@actions/tool-cache'
import * as core from '@actions/core'
import * as path from 'path';
import * as fs from 'fs';

const getKustomizeLink = (version: string): string => {
    switch (os.type()) {
        case 'Linux':
            return `https://github.com/kubernetes-sigs/kustomize/releases/download/kustomize%2Fv${version}/kustomize_v${version}_linux_amd64.tar.gz`

        case 'Darwin':
            return `https://github.com/kubernetes-sigs/kustomize/releases/download/kustomize%2Fv${version}/kustomize_v${version}_darwin_amd64.tar.gz`;
        case 'Windows_NT':
            return `https://github.com/kubernetes-sigs/kustomize/releases/download/kustomize%2Fv${version}/kustomize_v${version}_windows_amd64.tar.gz`;
        default:
            throw Error("Could not find correct OS")
    }
}

const getToolWithExtension = (toolName) => os.type() == 'Windows_NT' ? `${toolName}.exe` : toolName;

export const setupKustomize = async (version) => {
    const toolName = 'kustomize';
    
    let cachedToolpath = toolCache.find(toolName, version);
    if (!cachedToolpath) {
        const location = await toolCache.downloadTool(getKustomizeLink(version));
        const unzipped = await toolCache.extractTar(location);
        cachedToolpath = await toolCache.cacheDir(unzipped, toolName, version)
    }

    const kustomizePath = path.join(cachedToolpath, getToolWithExtension(toolName));
    fs.chmodSync(kustomizePath, '777');

    core.addPath(cachedToolpath)
}
