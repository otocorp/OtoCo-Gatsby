import React from 'react'

import { QuestionCircle } from 'react-bootstrap-icons'

//style
import './InfoCard.scss'

type Props = {
  classProp?: string
  titleText: string
  infoText: string
  useGraidentText?: boolean
  infoLink?: string
}

const InfoCard = ({
  classProp = '',
  titleText,
  infoText,
  useGraidentText = false,
  infoLink,
}: Props) => (
  <div className={`info-card ${classProp}`}>
    <div className={'text-wrapper'}>
      <span
        className={
          useGraidentText ? 'graident-text info-card-title' : 'info-card-title'
        }
      >
        {titleText}
        {infoLink && (
          <a
            className={'info-link'}
            href={infoLink}
            rel="noopener noreferrer"
            target="_blank"
          >
            <QuestionCircle />
          </a>
        )}
      </span>
      <p>{infoText}</p>
    </div>
  </div>
)

export default InfoCard
