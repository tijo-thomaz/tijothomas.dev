import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MessageBubble } from './MessageBubble';

describe('MessageBubble Molecule', () => {
  it('renders message content correctly', () => {
    render(<MessageBubble message="Hello world" sender="user" />);
    expect(screen.getByText('Hello world')).toBeInTheDocument();
  });

  it('applies user message styling', () => {
    render(<MessageBubble message="User message" sender="user" />);
    const bubble = screen.getByText('User message').closest('div');
    expect(bubble).toHaveClass('bg-blue-500', 'text-white', 'ml-auto');
  });

  it('applies bot message styling', () => {
    render(<MessageBubble message="Bot response" sender="bot" />);
    const bubble = screen.getByText('Bot response').closest('div');
    expect(bubble).toHaveClass('bg-gray-200', 'text-gray-900', 'mr-auto');
  });

  it('handles multiline messages', () => {
    const multilineMessage = `First line
Second line
Third line`;
    render(<MessageBubble message={multilineMessage} sender="user" />);
    expect(screen.getByText(content => content.includes('First line') && content.includes('Second line'))).toBeInTheDocument();
  });

  it('displays timestamp when provided', () => {
    const timestamp = new Date('2023-01-01T12:00:00Z');
    render(<MessageBubble message="Timestamped message" sender="user" timestamp={timestamp} />);
    expect(screen.getByText('12:00 PM')).toBeInTheDocument();
  });

  it('shows avatar for bot messages', () => {
    render(<MessageBubble message="Bot message" sender="bot" showAvatar />);
    expect(screen.getByRole('img', { name: /bot avatar/i })).toBeInTheDocument();
  });

  it('shows avatar for user messages when specified', () => {
    render(<MessageBubble message="User message" sender="user" showAvatar />);
    expect(screen.getByRole('img', { name: /user avatar/i })).toBeInTheDocument();
  });

  it('applies custom className', () => {
    render(<MessageBubble message="Custom message" sender="user" className="custom-bubble" />);
    const container = screen.getByText('Custom message').closest('div');
    expect(container).toHaveClass('custom-bubble');
  });

  it('handles loading state', () => {
    render(<MessageBubble message="" sender="bot" loading />);
    expect(screen.getByText('•••')).toBeInTheDocument();
  });

  it('applies correct border radius', () => {
    render(<MessageBubble message="Rounded message" sender="user" />);
    const bubble = screen.getByText('Rounded message').closest('div');
    expect(bubble).toHaveClass('rounded-2xl');
  });

  it('handles error state', () => {
    render(<MessageBubble message="Error occurred" sender="bot" error />);
    const bubble = screen.getByText('Error occurred').closest('div');
    expect(bubble).toHaveClass('bg-red-100', 'text-red-800', 'border-red-300');
  });

  it('displays sender name when provided', () => {
    render(<MessageBubble message="Named message" sender="user" senderName="John Doe" />);
    expect(screen.getByText('John Doe')).toBeInTheDocument();
  });

  it('handles markdown content', () => {
    render(<MessageBubble message="**Bold text** and *italic text*" sender="bot" enableMarkdown />);
    expect(screen.getByText('Bold text')).toBeInTheDocument();
  });

  it('applies theme colors correctly', () => {
    render(<MessageBubble message="Themed message" sender="bot" />);
    const bubble = screen.getByText('Themed message').closest('div');
    expect(bubble).toHaveStyle({ 
      backgroundColor: 'var(--theme-secondary)',
      color: 'var(--theme-text)'
    });
  });

  it('handles very long messages', () => {
    const longMessage = 'A'.repeat(500);
    render(<MessageBubble message={longMessage} sender="user" />);
    expect(screen.getByText(longMessage)).toBeInTheDocument();
  });

  it('shows typing animation for bot loading state', () => {
    render(<MessageBubble message="" sender="bot" loading />);
    const dots = screen.getByText('•••');
    expect(dots).toHaveClass('animate-pulse');
  });

  it('handles special characters in messages', () => {
    const specialMessage = "Special chars: !@#$%^&*()_+-=[]{}|;':\",./<>?";
    render(<MessageBubble message={specialMessage} sender="user" />);
    expect(screen.getByText(specialMessage)).toBeInTheDocument();
  });

  it('applies correct max width', () => {
    render(<MessageBubble message="Width constrained" sender="user" />);
    const bubble = screen.getByText('Width constrained').closest('div');
    expect(bubble).toHaveClass('max-w-xs', 'sm:max-w-md');
  });

  it('handles reactions when provided', () => {
    render(<MessageBubble message="Reaction test" sender="bot" reactions={['👍', '❤️']} />);
    expect(screen.getByText('👍')).toBeInTheDocument();
    expect(screen.getByText('❤️')).toBeInTheDocument();
  });

  it('shows delivery status for user messages', () => {
    render(<MessageBubble message="Delivered" sender="user" status="delivered" />);
    expect(screen.getByTitle('Delivered')).toBeInTheDocument();
  });

  it('preserves whitespace in code blocks', () => {
    const codeMessage = `\`\`\`javascript
function hello() {
    console.log('Hello');
}
\`\`\``;
    render(<MessageBubble message={codeMessage} sender="bot" enableMarkdown />);
    const code = screen.getByText('function hello() {');
    expect(code.parentElement).toHaveClass('whitespace-pre');
  });
});
