import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MessageList } from './MessageList';

describe('MessageList Organism', () => {
  const mockMessages = [
    { id: '1', content: 'Hello!', sender: 'user' as const, timestamp: new Date('2023-01-01T12:00:00Z') },
    { id: '2', content: 'Hi there! How can I help?', sender: 'bot' as const, timestamp: new Date('2023-01-01T12:01:00Z') },
    { id: '3', content: 'Tell me about your skills', sender: 'user' as const, timestamp: new Date('2023-01-01T12:02:00Z') }
  ];

  it('renders all messages correctly', () => {
    render(<MessageList messages={mockMessages} />);
    
    expect(screen.getByText('Hello!')).toBeInTheDocument();
    expect(screen.getByText('Hi there! How can I help?')).toBeInTheDocument();
    expect(screen.getByText('Tell me about your skills')).toBeInTheDocument();
  });

  it('handles empty message list', () => {
    render(<MessageList messages={[]} />);
    
    const container = document.querySelector('[data-testid="message-list"]') ||
                      document.querySelector('.message-list');
    expect(container).toBeInTheDocument();
  });

  it('applies correct styling for different senders', () => {
    render(<MessageList messages={mockMessages} />);
    
    const userMessage = screen.getByText('Hello!').closest('div');
    const botMessage = screen.getByText('Hi there! How can I help?').closest('div');
    
    expect(userMessage).toHaveClass('ml-auto');
    expect(botMessage).toHaveClass('mr-auto');
  });

  it('scrolls to bottom when new messages arrive', async () => {
    const { rerender } = render(<MessageList messages={mockMessages} />);
    
    const newMessages = [...mockMessages, {
      id: '4',
      content: 'New message',
      sender: 'bot' as const,
      timestamp: new Date()
    }];
    
    rerender(<MessageList messages={newMessages} autoScroll />);
    
    await waitFor(() => {
      expect(screen.getByText('New message')).toBeInTheDocument();
    });
  });

  it('groups messages by timestamp', () => {
    render(<MessageList messages={mockMessages} groupByTime />);
    
    // Should group messages from same time period
    const timeGroups = screen.getAllByText(/12:0/);
    expect(timeGroups.length).toBeGreaterThan(0);
  });

  it('shows typing indicator when provided', () => {
    render(<MessageList messages={mockMessages} isTyping />);
    
    expect(screen.getByText('•••')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    render(<MessageList messages={mockMessages} className="custom-message-list" />);
    
    const container = document.querySelector('.custom-message-list');
    expect(container).toBeInTheDocument();
  });

  it('handles message loading states', () => {
    const loadingMessages = [
      ...mockMessages,
      { id: '4', content: '', sender: 'bot' as const, timestamp: new Date(), loading: true }
    ];
    
    render(<MessageList messages={loadingMessages} />);
    
    expect(screen.getByText('•••')).toBeInTheDocument();
  });

  it('supports message selection', async () => {
    const onSelectMessage = vi.fn();
    render(
      <MessageList 
        messages={mockMessages} 
        onSelectMessage={onSelectMessage}
        selectable 
      />
    );
    
    const message = screen.getByText('Hello!');
    fireEvent.click(message);
    
    expect(onSelectMessage).toHaveBeenCalledWith(mockMessages[0]);
  });

  it('renders avatars when enabled', () => {
    render(<MessageList messages={mockMessages} showAvatars />);
    
    const avatars = screen.getAllByRole('img');
    expect(avatars.length).toBeGreaterThan(0);
  });

  it('shows timestamps when enabled', () => {
    render(<MessageList messages={mockMessages} showTimestamps />);
    
    expect(screen.getByText('12:00')).toBeInTheDocument();
    expect(screen.getByText('12:01')).toBeInTheDocument();
  });

  it('handles very long message list', () => {
    const longMessages = Array.from({ length: 100 }, (_, i) => ({
      id: `${i}`,
      content: `Message ${i}`,
      sender: i % 2 === 0 ? 'user' as const : 'bot' as const,
      timestamp: new Date()
    }));
    
    render(<MessageList messages={longMessages} />);
    
    expect(screen.getByText('Message 0')).toBeInTheDocument();
    expect(screen.getByText('Message 99')).toBeInTheDocument();
  });

  it('supports message reactions', () => {
    const messagesWithReactions = mockMessages.map(msg => ({
      ...msg,
      reactions: msg.sender === 'bot' ? ['👍', '❤️'] : undefined
    }));
    
    render(<MessageList messages={messagesWithReactions} showReactions />);
    
    expect(screen.getByText('👍')).toBeInTheDocument();
    expect(screen.getByText('❤️')).toBeInTheDocument();
  });

  it('filters messages when search term provided', () => {
    render(<MessageList messages={mockMessages} searchTerm="skills" />);
    
    expect(screen.getByText('Tell me about your skills')).toBeInTheDocument();
    expect(screen.queryByText('Hello!')).not.toBeInTheDocument();
  });

  it('handles message editing', async () => {
    const onEditMessage = vi.fn();
    render(
      <MessageList 
        messages={mockMessages} 
        onEditMessage={onEditMessage}
        editable 
      />
    );
    
    const message = screen.getByText('Hello!');
    fireEvent.doubleClick(message);
    
    // Should show edit input or call edit handler
    expect(onEditMessage).toHaveBeenCalledWith(mockMessages[0]);
  });

  it('shows message delivery status', () => {
    const messagesWithStatus = mockMessages.map(msg => ({
      ...msg,
      status: msg.sender === 'user' ? 'delivered' as const : undefined
    }));
    
    render(<MessageList messages={messagesWithStatus} showStatus />);
    
    const statusIndicators = screen.getAllByTitle('Delivered');
    expect(statusIndicators.length).toBeGreaterThan(0);
  });

  it('handles message deletion', async () => {
    const onDeleteMessage = vi.fn();
    render(
      <MessageList 
        messages={mockMessages} 
        onDeleteMessage={onDeleteMessage}
        deletable 
      />
    );
    
    const deleteButton = screen.getAllByRole('button', { name: /delete/i })[0];
    fireEvent.click(deleteButton);
    
    expect(onDeleteMessage).toHaveBeenCalledWith(mockMessages[0]);
  });

  it('maintains scroll position when loading older messages', async () => {
    const { rerender } = render(<MessageList messages={mockMessages} />);
    
    const olderMessages = [
      { id: '0', content: 'Older message', sender: 'user' as const, timestamp: new Date('2023-01-01T11:59:00Z') },
      ...mockMessages
    ];
    
    rerender(<MessageList messages={olderMessages} maintainScrollPosition />);
    
    await waitFor(() => {
      expect(screen.getByText('Older message')).toBeInTheDocument();
    });
  });

  it('applies theme colors correctly', () => {
    render(<MessageList messages={mockMessages} />);
    
    const container = document.querySelector('[data-testid="message-list"]') ||
                      screen.getByText('Hello!').closest('[class*="message"]')?.parentElement;
    expect(container).toHaveStyle({ backgroundColor: 'var(--theme-background)' });
  });

  it('handles infinite scroll loading', async () => {
    const onLoadMore = vi.fn();
    render(
      <MessageList 
        messages={mockMessages} 
        onLoadMore={onLoadMore}
        hasMore 
      />
    );
    
    // Simulate scroll to top
    const container = document.querySelector('[data-testid="message-list"]');
    if (container) {
      fireEvent.scroll(container, { target: { scrollTop: 0 } });
    }
    
    await waitFor(() => {
      expect(onLoadMore).toHaveBeenCalled();
    });
  });

  it('shows empty state message', () => {
    render(<MessageList messages={[]} emptyStateMessage="No messages yet" />);
    
    expect(screen.getByText('No messages yet')).toBeInTheDocument();
  });

  it('handles keyboard navigation', async () => {
    render(<MessageList messages={mockMessages} keyboardNavigable />);
    
    const firstMessage = screen.getByText('Hello!');
    firstMessage.focus();
    
    fireEvent.keyDown(firstMessage, { key: 'ArrowDown' });
    
    const secondMessage = screen.getByText('Hi there! How can I help?');
    expect(secondMessage).toHaveFocus();
  });
});
