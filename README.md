# DynamoDB Export Action

Action to export data from DynamoDB table to S3 bucket.

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
- `s3-bucket` - (**Required**) The name of the Amazon S3 bucket to export the snapshot to.
- `s3-prefix` - (Optional) S3 prefix to export data to.
- `export-format` - (Optional) The format for the exported data. Valid values are `DYNAMODB_JSON` or `ION`.  The default value is `DYNAMODB_JSON`.

### Outputs

- `export-arn` - The Amazon Resource Name (ARN) of the table export.
- `export-id` - The ID of the table export.
- `export-manifest` - The name of the manifest file for the export task.
