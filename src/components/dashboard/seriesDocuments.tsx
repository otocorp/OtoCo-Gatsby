import React, { Dispatch, FC, useState } from 'react'
import { connect } from 'react-redux'
import { PDFAssembler } from 'pdfassembler'
import fileSaver from 'file-saver'
import { SeriesType, ManagementActionTypes } from '../../state/management/types'
import Icon from '../icon/icon'
import { faDownload } from '@fortawesome/free-solid-svg-icons'
import { IState } from '../../state/types'

interface Props {
  managing?: SeriesType
  dispatch: Dispatch<ManagementActionTypes>
}

const pdfs = {
  de: {
    agreement: require('../../../static/pdfs/DOA_de.pdf'),
    page1: require('../../../static/pdfs/page1_de.pdf'),
    page21: require('../../../static/pdfs/page21_de.pdf'),
    page22: require('../../../static/pdfs/page22_de.pdf'),
  },
  wy: {
    agreement: require('../../../static/pdfs/DOA_wy.pdf'),
    page1: require('../../../static/pdfs/page1_wy.pdf'),
    page21: require('../../../static/pdfs/page21_wy.pdf'),
    page22: require('../../../static/pdfs/page22_wy.pdf'),
  },
}

const SeriesDocuments: FC<Props> = ({
  account,
  network,
  managing,
  dispatch,
}: Props) => {
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

  const exportPDF = async () => {
    if (!managing) return
    console.log(managing)
    const prefix = managing.jurisdiction.substring(0, 2).toLowerCase()
    const blob = await fetch(pdfs[prefix].agreement).then((r) => r.blob())
    let page1 = await fetch(pdfs[prefix].page1).then((r) => r.text())
    let page21 = await fetch(pdfs[prefix].page21).then((r) => r.text())
    let page22 = await fetch(pdfs[prefix].page22).then((r) => r.text())
    // Replace texts on placeholders
    if (prefix === 'de')
      page1 = page1.replace(
        '{SERIES}',
        managing.name.length * 300 - 3000 + ' ( ' + removeSpecial(managing.name)
      )
    if (prefix === 'wy')
      page1 = page1.replace(
        'OTOCO WY LLC - {SERIES}',
        managing.name.length * 300 -
          3000 +
          ' (OTOCO WY LLC - ' +
          removeSpecial(managing.name)
      )
    page1 = page1.replace(
      '0xXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
      managing.contract
    )
    page1 = page1.replace(
      'DD/MM/YYYY',
      managing.created.getUTCDate() +
        '/' +
        (managing.created.getUTCMonth() + 1) +
        '/' +
        managing.created.getUTCFullYear()
    )
    page1 = page1.replace(
      'HH:MM',
      managing.created.getUTCHours() +
        ':' +
        (managing.created.getUTCMinutes() < 10
          ? '0' + managing.created.getUTCMinutes()
          : managing.created.getUTCMinutes())
    )
    page21 = page21.replace(
      '0xXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
      managing.owner
    )
    page22 = page22.replace(
      '0xXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
      managing.owner
    )
    //console.log(page1)
    // Create a new pdf based on Agreeement file
    const newPdf = new PDFAssembler(blob)
    newPdf.getPDFStructure().then(function (pdf) {
      //console.log(pdf['/Root']['/Pages']['/Kids'][0]['/Contents']['stream'])
      // console.log(pdf['/Root'])
      // Replace agreement pages for new ones
      // console.log(page1);
      pdf['/Root']['/Pages']['/Kids'][0]['/Contents']['stream'] = page1
      pdf['/Root']['/Pages']['/Kids'][20]['/Contents']['stream'] = page21
      pdf['/Root']['/Pages']['/Kids'][21]['/Contents']['stream'] = page22
      //Remove last page from Source file
      pdf['/Root']['/Pages']['/Kids'].splice(-1)
      newPdf
        .assemblePdf('Series_Operating_Agreement.pdf')
        .then(function (pdfFile) {
          fileSaver.saveAs(pdfFile, 'Series_Operating_Agreement.pdf')
        })
    })
  }

  return (
    <div className="card">
      <h6 className="card-header">Documents</h6>
      <div className="card-body">
        <div className="small">Download documents related to your company:</div>
        <a href="#" className="small card-link" onClick={exportPDF}>
          <Icon icon={faDownload}></Icon>
          <span style={{ marginLeft: '8px' }}>Series Operating Agreement</span>
        </a>
      </div>
    </div>
  )
}

export default connect((state: IState) => ({
  account: state.account.account,
  network: state.account.network,
  managing: state.management.managing,
}))(SeriesDocuments)
