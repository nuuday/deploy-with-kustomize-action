import * as core from '@actions/core'
import * as exec from '@actions/exec'
import YAML from 'yaml';
import fs from 'fs'
import {setupKustomize} from './kustomize'
import {setupKubectl} from './kubectl'

async function run() {
    const registry = core.getInput("registry", {required: true})
    const imageInputs = core.getInput("images", {required: true})
    const overlay = core.getInput("overlay", {required: true})
    const monitoring = core.getInput("monitoring")

    await setupKustomize(core.getInput('kustomize'))
    await setupKubectl(core.getInput('kubectl'))

    await setImages(registry, imageInputs, overlay)
    await deploy()
    
    if (monitoring === "true") {
        await monitorDeployment()
    }
}

const setImages = async (registry, imageInputs, overlay) => {
    const images = imageInputs.split("\n")
    for (const image of images) {
        const imageAndVersion = image.split(":")
        const img = imageAndVersion[0]
        const latest = `${registry}/${img}:latest`
        const current = `${registry}/${image}`

        await runKustomize(overlay, ["edit", "set", "image", `${latest}=${current}`])
    }
}

const deploy = async () => {
    const overlay = core.getInput("overlay");
    const resourceLocation = `${process.cwd()}/resources.yaml`

    await runKustomize(overlay, ["-o", resourceLocation, "build"])
    await execHelper("kubectl", ["apply", "-f", resourceLocation])
}

const runKustomize = async (overlay, args) => {
    await execHelper("kustomize", args, {
        cwd: overlay
    })
}

const monitorDeployment = async () => {
    const resourceLocation = `${process.cwd()}/resources.yaml`

    const file = fs.readFileSync(resourceLocation)
    const manifests = YAML.parseAllDocuments(file.toString('utf8'))
    const deployments = manifests
        .map(x => x.toJSON())
        .filter((x: any) => x.kind === "Deployment" || x.kind === "StatefulSet" || x.kind === "DaemonSet") as any[];

    for (const deployment of deployments) {
        await execHelper("kubectl", [
            "rollout",
            "status",
            "-n",
            deployment.metadata.namespace,
            "--timeout",
            "600s",
            `${deployment.kind}/${deployment.metadata.name}`
        ])
    }
}


const execHelper = async (tool, args: string[], options: exec.ExecOptions = {}) => {
    let stdout = ""
    let stderr = ""

    const opts = {
        ...options,
        listeners: {
            stdout: (data) => {
                stdout += data.toString()
            },
            stderr: (data) => {
                stderr += data.toString()
            }
        }
    }

    const exitCode = await exec.exec(tool, args, opts)
    if (exitCode != 0) {
        const errMsg = `${tool} exited with code: ${exitCode} \n ${stderr}`
        throw Error(errMsg)
    }

    return exitCode
}

run().catch(core.setFailed)