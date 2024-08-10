# DynamoDB Export Action

Action to export data from DynamoDB table to S3 bucket.

## Prerequisites

To use this action, the IAM role that executes the action must be allowed the
following actions.

- `dynamodb:DescribeTable`
- `dynamodb:ExportTableToPointInTime`
- `dynamodb:DescribeExport`
- `s3:PutObject`
- `s3:PubObjectAcl`
- `s3:AbortMultipartUpload`

Example of IAM policy document:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Action": ["dynamodb:ExportTableToPointInTime", "dynamodb:DescribeTable"],
      "Effect": "Allow",
      "Resource": "arn:aws:dynamodb:<REGION>:<ACCOUNT_ID>:table/<TABLE>"
    },
    {
      "Action": "dynamodb:DescribeExport",
      "Effect": "Allow",
      "Resource": "arn:aws:dynamodb:<REGION>:<ACCOUNT_ID>:table/<TABLE>/export/*"
    },
    {
      "Action": ["s3:PutObjectAcl", "s3:PutObject", "s3:AbortMultipartUpload"],
      "Effect": "Allow",
      "Resource": "arn:aws:s3:::<S3_BUCKET>/*"
    }
  ]
}
```

## Usage

```yaml
- uses: koki-develop/dynamodb-export-action@v1
  with:
    table: 'my-table'
    s3-bucket: 'my-bucket'
    s3-prefix: 'my-prefix' # Optional
    export-format: 'DYNAMODB_JSON' # Optional
```

### Inputs

- `table` - (**Required**) The name of the DynamoDB table to export data from.
- `s3-bucket` - (**Required**) The name of the Amazon S3 bucket to export the
  snapshot to.
- `s3-prefix` - (Optional) S3 prefix to export data to.
- `export-format` - (Optional) The format for the exported data. Valid values
  are `DYNAMODB_JSON` or `ION`. The default value is `DYNAMODB_JSON`.

### Outputs

- `export-arn` - The Amazon Resource Name (ARN) of the table export.
- `export-id` - The ID of the table export.
- `export-manifest` - The name of the manifest file for the export task.
