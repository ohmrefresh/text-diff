import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Header } from '../../components/Header'

describe('Header', () => {
  it('should render the title', () => {
    render(<Header leftTextLength={0} rightTextLength={0} diffMode="line" />)
    expect(screen.getByText('Compare text differences instantly')).toBeInTheDocument()
  })

  it('should display left text length', () => {
    render(<Header leftTextLength={100} rightTextLength={0} diffMode="line" />)
    expect(screen.getByText('100 chars')).toBeInTheDocument()
  })

  it('should display right text length', () => {
    render(<Header leftTextLength={0} rightTextLength={250} diffMode="line" />)
    expect(screen.getByText('250 chars')).toBeInTheDocument()
  })

  it('should display line by line mode', () => {
    render(<Header leftTextLength={0} rightTextLength={0} diffMode="line" />)
    expect(screen.getByText('Line by line')).toBeInTheDocument()
  })

  it('should display word level mode', () => {
    render(<Header leftTextLength={0} rightTextLength={0} diffMode="word" />)
    expect(screen.getByText('Word level')).toBeInTheDocument()
  })

  it('should format large numbers with commas', () => {
    render(<Header leftTextLength={1000000} rightTextLength={0} diffMode="line" />)
    expect(screen.getByText('1,000,000 chars')).toBeInTheDocument()
  })
})
