import * as os from 'os';
import * as toolCache from '@actions/tool-cache'
import * as core from '@actions/core'

const getkubectlDownloadURL = (version: string): string => {
    switch (os.type()) {
        case 'Linux':
            return `https://storage.googleapis.com/kubernetes-release/release/${version}/bin/linux/amd64/kubectl`;
        case 'Darwin':
            return `https://storage.googleapis.com/kubernetes-release/release/${version}/bin/darwin/amd64/kubectl`
        case 'Windows_NT':
            return `https://storage.googleapis.com/kubernetes-release/release/${version}/bin/windows/amd64/kubectl.exe`
        default:
            throw Error("Could not find correct OS")
    }
}

export const setupKubectl = async (version) => {
    const toolName = 'kubectl';
    
    let cachedToolpath = toolCache.find(toolName, version);
    if (!cachedToolpath) {
        const location = await toolCache.downloadTool(getkubectlDownloadURL(version));
        const unzipped = await toolCache.extractTar(location);
        cachedToolpath = await toolCache.cacheDir(unzipped, toolName, version)
    }

    core.addPath(cachedToolpath)
}
