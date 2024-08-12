import * as core from '@actions/core'
import { ExportFormat } from '@aws-sdk/client-dynamodb'
import { describeTable, exportTable, waitForExport } from './dynamodb'

export async function run(): Promise<void> {
  try {
    const inputs = {
      table: core.getInput('table'),
      s3Bucket: core.getInput('s3-bucket'),
      s3Prefix: core.getInput('s3-prefix'),
      exportFormat: core.getInput('export-format')
    } as const

    switch (inputs.exportFormat) {
      case ExportFormat.DYNAMODB_JSON:
      case ExportFormat.ION:
        break
      default:
        throw new Error(`Unsupported export format: ${inputs.exportFormat}`)
    }

    // Describe the table
    const table = await describeTable(inputs.table)

    // Export the table
    const exp = await exportTable({
      tableArn: table.arn,
      s3Bucket: inputs.s3Bucket,
      s3Prefix: inputs.s3Prefix,
      format: inputs.exportFormat
    })
    core.setOutput('export-arn', exp.arn)
    core.setOutput('export-id', exp.id)
    core.startGroup(
      `Exporting table ${table.name} to s3://${inputs.s3Bucket}/${inputs.s3Prefix} in ${inputs.exportFormat} format...`
    )
    core.info(`Table ARN: ${table.arn}`)
    core.info(`Export ARN: ${exp.arn}`)
    core.endGroup()

    // Wait for the export to complete
    const finishedExp = await waitForExport(exp.arn)
    core.info('Export completed.')
    core.setOutput('export-manifest', finishedExp.exportManifest)
  } catch (error) {
    if (error instanceof Error) core.setFailed(error.message)
    throw error
  }
}
