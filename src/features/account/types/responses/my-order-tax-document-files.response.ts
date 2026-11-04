export interface IMyOrderTaxDocumentFile {
  url: string
  expiresAt: string
}

export interface IMyOrderTaxDocumentFiles {
  xml: IMyOrderTaxDocumentFile
  pdf: IMyOrderTaxDocumentFile
}
