import React, { useContext, useState } from 'react'
import Button from '../../components/common/Button'
import { ReactComponent as CheckSvg } from '../../img/check.svg'
import { ReactComponent as CloseSvg } from '../../img/close.svg'
import { FormState } from '../../types/FormState'
import { sendEvent } from '../../utils/gtm'
import classNames from 'classnames'
import FormContext from '../../context/FormContext'
import { createNewLead } from '../../helpers/api'
import styles from './ContactSalesForm.module.scss'

interface ContactSalesFormProps {
  className?: string | string[]
}
export default function ContactSalesForm({ className }: ContactSalesFormProps) {
  const [email, setEmail] = useState('')
  const [website, setWebsite] = useState('')
  const { formState, errorMessage, updateFormState, updateErrorMessage } = useContext(FormContext)

  async function handleSubmit(e) {
    e.preventDefault()

    updateFormState(FormState.Loading)

    const { ok, error } = await createNewLead(email, website)

    if (ok) {
      updateFormState(FormState.Success)
      sendEvent({ event: 'leadSubmit.success' })
    } else {
      updateErrorMessage(error.message || 'Something went wrong. Please try again later.')
      updateFormState(FormState.Failed)
      setTimeout(() => {
        updateFormState(FormState.Default)
      }, 2500)
      sendEvent({ event: 'leadSubmit.error' })
    }
  }

  return (
    <form
      className={classNames(
        className,
        styles.contactSalesForm,
        { [styles.success]: formState === FormState.Success },
        { [styles.failed]: formState === FormState.Failed },
        { [styles.loading]: formState === FormState.Loading }
      )}
      onSubmit={handleSubmit}
    >
      {(formState === FormState.Default || formState === FormState.Loading) && (
        <div className={styles.form}>
          <input
            type='email'
            name='email'
            required
            className={styles.input}
            placeholder='Enter your email'
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={formState === FormState.Loading}
          />
          <input
            type='url'
            name='website'
            required
            className={styles.input}
            placeholder='Enter your website'
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
            disabled={formState === FormState.Loading}
          />

          <Button className={styles.button} type='submit' disabled={formState === FormState.Loading}>
            {formState === FormState.Loading ? 'Submitting' : 'Send'}
          </Button>
        </div>
      )}

      {formState === FormState.Success && (
        <div className={classNames(styles.state, styles.success)}>
          <div className={styles.message}>Thank you! Our sales team will be in contact with you shortly.</div>
          <CheckSvg className={styles.icon} />
        </div>
      )}

      {formState === FormState.Failed && (
        <div className={classNames(styles.state, styles.failed)}>
          <div className={styles.message}>{errorMessage}</div>
          <CloseSvg className={styles.icon} />
        </div>
      )}
    </form>
  )
}