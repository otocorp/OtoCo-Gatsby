import React, { Dispatch, FC, useState } from 'react'
import { connect } from 'react-redux'
import { PDFDocument, StandardFonts } from 'pdf-lib'
import {
  SeriesType,
  ManagementActionTypes,
} from '../../../state/management/types'
import { FileEarmarkText } from 'react-bootstrap-icons'
import { IState } from '../../../state/types'

interface Props {
  managing?: SeriesType
  dispatch: Dispatch<ManagementActionTypes>
}

const pdfs = {
  de: {
    agreement: require('../../../../static/pdfs/DOA_de.pdf'),
  },
  wy: {
    agreement: require('../../../../static/pdfs/DOA_wy.pdf'),
  },
}

const SeriesDocuments: FC<Props> = ({ managing, dispatch }: Props) => {
  const toUnicode = (str: string) => {
    return str
      .split('')
      .map(function (value) {
        const temp = value.charCodeAt(0).toString(16).toUpperCase()
        if (temp.length > 2) {
          return '\\u' + temp
        }
        return value
      })
      .join('')
  }

  const removeSpecial = (str: string) => {
    return toUnicode(str)
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
  }

  function saveByteArray(reportName, byte) {
    const blob = new Blob([byte], { type: 'application/pdf' })
    const link = document.createElement('a')
    link.href = window.URL.createObjectURL(blob)
    const fileName = reportName
    link.download = fileName
    link.click()
  }

  const exportPDF = async () => {
    if (!managing) return
    const prefix = managing.jurisdiction.substring(0, 2).toLowerCase()
    const existingPdfBytes = await fetch(pdfs[prefix].agreement).then((res) =>
      res.arrayBuffer()
    )
    let seriesName = removeSpecial(managing.name)
    if (prefix === 'wy')
      seriesName = 'OTOCO WY LLC - ' + removeSpecial(managing.name)

    const pdfDoc = await PDFDocument.load(existingPdfBytes)
    const form = pdfDoc.getForm()
    const TimesBold = await pdfDoc.embedFont(StandardFonts.TimesRomanBold)
    const Times = await pdfDoc.embedFont(StandardFonts.TimesRoman)
    form.getTextField('Series').setText(seriesName)
    try {
      form.getTextField('Address').setText(managing.contract)
    } catch (err) {
      console.error('Wyoming has no address field')
    }
    form
      .getTextField('Date')
      .setText(
        managing.created.getUTCDate() +
          '/' +
          (managing.created.getUTCMonth() + 1) +
          '/' +
          managing.created.getUTCFullYear() +
          ' ' +
          managing.created.getUTCHours() +
          ':' +
          (managing.created.getUTCMinutes() < 10
            ? '0' + managing.created.getUTCMinutes()
            : managing.created.getUTCMinutes()) +
          ' UTC'
      )
    form.updateFieldAppearances(TimesBold)
    form.getTextField('ByManager').setText('By ' + managing.owner + ', Manager')
    form.getTextField('Owner').setText('(' + managing.owner + ' - MEMBER)')
    form.updateFieldAppearances(Times)
    form.flatten()
    const pdfBytes = await pdfDoc.save()
    saveByteArray('Series_Operating_Agreement.pdf', pdfBytes)
  }

  return (
    <div>
      <div className="d-grid gap-1 mb-5">
        <h3 className="m-0">Files</h3>
        <div className="small">Download files related to your company:</div>
        <div className="mt-2">
          <a href="#" className="card-link" onClick={exportPDF}>
            {/* <Icon icon={faDownload}></Icon> */}
            <FileEarmarkText className="fix-icon-alignment" />
            <span style={{ marginLeft: '0.5em' }}>
              Series Operating Agreement
            </span>
          </a>
        </div>
      </div>
    </div>
  )
}

export default connect((state: IState) => ({
  account: state.account.account,
  network: state.account.network,
  managing: state.management.managing,
}))(SeriesDocuments)
