import * as os from 'os';
import * as toolCache from '@actions/tool-cache'
import * as core from '@actions/core'
import * as path from 'path';
import * as fs from 'fs';


const getkubectlDownloadURL = (version: string): string => {
    switch (os.type()) {
        case 'Linux':
            return `https://storage.googleapis.com/kubernetes-release/release/v${version}/bin/linux/amd64/kubectl`;
        case 'Darwin':
            return `https://storage.googleapis.com/kubernetes-release/release/v${version}/bin/darwin/amd64/kubectl`;
        case 'Windows_NT':
            return `https://storage.googleapis.com/kubernetes-release/release/v${version}/bin/windows/amd64/kubectl.exe`;
        default:
            throw Error("Could not find correct OS")
    }
}

const getToolWithExtension = (toolName) => os.type() == 'Windows_NT' ? `${toolName}.exe` : toolName;


export const setupKubectl = async (version) => {
    const toolName = 'kubectl';

    let cachedToolpath = toolCache.find(toolName, version);
    if (!cachedToolpath) {
        const location = await toolCache.downloadTool(getkubectlDownloadURL(version));
        cachedToolpath = await toolCache.cacheFile(location, getToolWithExtension(toolName), toolName, version)
    }

    const kubectlPath = path.join(cachedToolpath, getToolWithExtension(toolName));
    fs.chmodSync(kubectlPath, '777');

    core.addPath(cachedToolpath)
}
