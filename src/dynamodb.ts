import {
  DescribeExportCommand,
  DescribeTableCommand,
  DynamoDBClient,
  ExportDescription,
  ExportFormat,
  ExportStatus,
  ExportTableToPointInTimeCommand
} from '@aws-sdk/client-dynamodb'

export type Table = {
  arn: string
  name: string
}

const _client = new DynamoDBClient()

export const describeTable = async (name: string): Promise<Table> => {
  const response = await _client.send(
    new DescribeTableCommand({ TableName: name })
  )

  const table = response.Table!

  return {
    arn: table.TableArn!,
    name: table.TableName!
  }
}

export type Export = {
  arn: string
  id: string
  startTime: Date
  exportManifest?: string
}

export type ExportOptions = {
  tableArn: string
  s3Bucket: string
  s3Prefix: string
  format: ExportFormat
}

export const exportTable = async (options: ExportOptions): Promise<Export> => {
  const response = await _client.send(
    new ExportTableToPointInTimeCommand({
      TableArn: options.tableArn,
      S3Bucket: options.s3Bucket,
      S3Prefix: options.s3Prefix === '' ? undefined : options.s3Prefix,
      ExportFormat: options.format
    })
  )

  const exportDetail = response.ExportDescription!
  return _exportDescriptionToExport(exportDetail)
}

export const waitForExport = async (arn: string): Promise<Export> => {
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const response = await _client.send(
      new DescribeExportCommand({ ExportArn: arn })
    )
    const exportDetail = response.ExportDescription!
    const status = exportDetail.ExportStatus!

    switch (status) {
      case ExportStatus.IN_PROGRESS:
        await new Promise(resolve => setTimeout(resolve, 10_000))
        break
      case ExportStatus.COMPLETED:
        return _exportDescriptionToExport(exportDetail)
      case ExportStatus.FAILED:
        throw new Error(`Export failed: ${exportDetail.FailureMessage}`)
      default:
        throw new Error(`Unexpected export status: ${status}`)
    }
  }
}

const _exportDescriptionToExport = (description: ExportDescription): Export => {
  return {
    arn: description.ExportArn!,
    id: description.ExportArn!.split('/').slice(-1)[0],
    startTime: description.StartTime!,
    exportManifest: description.ExportManifest
  }
}
