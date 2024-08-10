import * as core from '@actions/core'
import {
  DescribeExportCommand,
  DescribeTableCommand,
  DynamoDBClient,
  ExportFormat,
  ExportStatus,
  ExportTableToPointInTimeCommand
} from '@aws-sdk/client-dynamodb'

export async function run(): Promise<void> {
  try {
    const table = core.getInput('table')
    const s3Bucket = core.getInput('s3-bucket')
    const s3Prefix = core.getInput('s3-prefix')
    const exportFormat = core.getInput('export-format')

    switch (exportFormat) {
      case ExportFormat.DYNAMODB_JSON:
      case ExportFormat.ION:
        break
      default:
        throw new Error(`Unsupported export format: ${exportFormat}`)
    }

    const client = new DynamoDBClient()

    const describeTableResponse = await client.send(
      new DescribeTableCommand({ TableName: table })
    )
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const tableDetail = describeTableResponse.Table!

    core.info(
      `Exporting table ${table} to s3://${s3Bucket}/${s3Prefix} in ${exportFormat} format.`
    )

    const exportResponse = await client.send(
      new ExportTableToPointInTimeCommand({
        TableArn: tableDetail.TableArn,
        S3Bucket: s3Bucket,
        S3Prefix: s3Prefix === '' ? undefined : s3Prefix,
        ExportFormat: exportFormat
      })
    )
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const exportArn = exportResponse.ExportDescription!.ExportArn

    let status: ExportStatus = ExportStatus.IN_PROGRESS
    do {
      const describeExportResponse = await client.send(
        new DescribeExportCommand({ ExportArn: exportArn })
      )

      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const exportDetail = describeExportResponse.ExportDescription!
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      status = exportDetail.ExportStatus!

      switch (status) {
        case ExportStatus.IN_PROGRESS:
          core.info('Export in progress...')
          await new Promise(resolve => setTimeout(resolve, 10_000))
          break
        case ExportStatus.COMPLETED:
          core.info('Export completed.')
          break
        case ExportStatus.FAILED:
          throw new Error(`Export failed: ${exportDetail.FailureMessage}`)
      }
    } while (status === ExportStatus.IN_PROGRESS)

    core.setOutput('export-arn', exportArn)
    core.setOutput('export-manifest', 'EXPORT_MANIFEST')
  } catch (error) {
    if (error instanceof Error) core.setFailed(error.message)
    throw error
  }
}
