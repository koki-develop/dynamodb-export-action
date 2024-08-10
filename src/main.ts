import * as core from '@actions/core'

export async function run(): Promise<void> {
  try {
    const table = core.getInput('table')
    const s3Bucket = core.getInput('s3-bucket')
    const s3Prefix = core.getInput('s3-prefix')
    const exportFormat = core.getInput('export-format')

    core.info(
      `Exporting table ${table} to s3://${s3Bucket}/${s3Prefix} in ${exportFormat} format.`
    )

    // TODO

    core.setOutput('export-arn', 'EXPORT_ARN')
    core.setOutput('export-manifest', 'EXPORT_MANIFEST')
  } catch (error) {
    if (error instanceof Error) core.setFailed(error.message)
    throw error
  }
}
