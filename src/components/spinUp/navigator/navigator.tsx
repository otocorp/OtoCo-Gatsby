import React, { FC } from 'react'
import { connect } from 'react-redux'
import { IState } from '../../state/types'
import { CheckCircleFill } from 'react-bootstrap-icons'
import step1Icon from '../../../../public/img/spinup1.svg'
import step2Icon from '../../../../public/img/spinup2.svg'
import step3Icon from '../../../../public/img/spinup3.svg'
import step4Icon from '../../../../public/img/spinup4.svg'
import './style.scss'
interface Props {
  step: number
}

const Navigator: FC<Props> = ({ step }: Props) => {
  const iconClass = 'nav-icon flex-sm-fill'

  return (
    <nav className="nav flex-row">
      <CheckCircleFill
        className={step > 1 ? 'nav-badge' : 'invisible'}
        size="11px"
      ></CheckCircleFill>
      <div
        className={
          step >= 1 ? iconClass + 'text-center' : iconClass + 'text-center o-50'
        }
      >
        <img src={step1Icon} className="mb-2" alt="Step 1 Icon" />
        <div className="small text-center just text-primary lh-sm">
          Check
          <br /> Name
        </div>
      </div>
      <div className="nav-hr flex-fill text-sm-start">
        <hr className="d-none d-sm-block"></hr>
      </div>
      <CheckCircleFill
        className={step > 2 ? 'nav-badge' : 'invisible'}
        size="11px"
      ></CheckCircleFill>
      <div
        className={
          step >= 2
            ? iconClass + 'text-sm-center'
            : iconClass + 'text-sm-center o-50'
        }
      >
        <img src={step2Icon} className="mb-2" alt="Step 2 Icon" />
        <div className="small text-center text-primary lh-sm">
          Connect Wallet
        </div>
      </div>
      <div className="nav-hr flex-fill text-sm-start">
        <hr className="d-none d-sm-block"></hr>
      </div>
      <CheckCircleFill
        className={step > 3 ? 'nav-badge' : 'invisible'}
        size="11px"
      ></CheckCircleFill>
      <div
        className={
          step >= 3 ? iconClass + 'text-center' : iconClass + 'text-center o-50'
        }
      >
        <img src={step3Icon} className="mb-2" alt="Step 3 Icon" />
        <div className="small text-sm-center text-primary lh-sm">
          Approve Payment
        </div>
      </div>
      <div className="nav-hr flex-fill text-sm-start">
        <hr className="d-none d-sm-block"></hr>
      </div>
      <CheckCircleFill
        className={step > 4 ? 'nav-badge' : 'invisible'}
        size="11px"
      ></CheckCircleFill>
      <div
        className={
          step >= 4 ? iconClass + 'text-sm-end' : iconClass + 'text-sm-end o-50'
        }
      >
        <img src={step4Icon} className="mb-2" alt="Step 4 Icon" />
        <div className="small text-center text-primary lh-sm">
          Review & Activate
        </div>
      </div>
    </nav>
  )
}

export default connect((state: IState) => ({
  currentStep: state.spinUp.currentStep,
}))(Navigator)
