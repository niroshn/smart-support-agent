import React from 'react';
import { render, screen } from '@testing-library/react';
import { ChatMessage } from './ChatMessage';
import { Message } from '../types';

describe('ChatMessage', () => {
  const mockUserMessage: Message = {
    id: '1',
    role: 'user',
    content: 'What credit cards do you offer?',
    timestamp: new Date('2024-01-01T12:00:00'),
  };

  const mockAssistantMessage: Message = {
    id: '2',
    role: 'assistant',
    content: 'We offer **CashBack Plus** and **TravelElite Platinum** credit cards.',
    timestamp: new Date('2024-01-01T12:00:05'),
  };

  const mockEscalationMessage: Message = {
    id: '3',
    role: 'assistant',
    content: 'I have flagged this conversation for immediate human assistance.',
    timestamp: new Date('2024-01-01T12:00:10'),
    isEscalation: true,
  };

  describe('User Messages', () => {
    it('should render user message with correct content', () => {
      render(<ChatMessage message={mockUserMessage} />);
      expect(screen.getByText('What credit cards do you offer?')).toBeInTheDocument();
    });

    it('should render user message with user icon', () => {
      const { container } = render(<ChatMessage message={mockUserMessage} />);
      const userIcon = container.querySelector('svg');
      expect(userIcon).toBeInTheDocument();
    });

    it('should render user message with correct timestamp', () => {
      render(<ChatMessage message={mockUserMessage} />);
      expect(screen.getByText('12:00 PM')).toBeInTheDocument();
    });

    it('should apply correct styling for user messages', () => {
      const { container } = render(<ChatMessage message={mockUserMessage} />);
      const messageContainer = container.querySelector('.justify-end');
      expect(messageContainer).toBeInTheDocument();
    });

    it('should render user message without markdown formatting', () => {
      render(<ChatMessage message={mockUserMessage} />);
      const messageContent = screen.getByText('What credit cards do you offer?');
      expect(messageContent.closest('div')).not.toHaveClass('markdown-content');
    });
  });

  describe('Assistant Messages', () => {
    it('should render assistant message with correct content', () => {
      render(<ChatMessage message={mockAssistantMessage} />);
      expect(screen.getByText(/CashBack Plus/)).toBeInTheDocument();
      expect(screen.getByText(/TravelElite Platinum/)).toBeInTheDocument();
    });

    it('should render assistant message with bot icon', () => {
      const { container } = render(<ChatMessage message={mockAssistantMessage} />);
      const botIcon = container.querySelector('svg');
      expect(botIcon).toBeInTheDocument();
    });

    it('should render assistant message with markdown support', () => {
      const { container } = render(<ChatMessage message={mockAssistantMessage} />);
      const markdownContent = container.querySelector('.markdown-content');
      expect(markdownContent).toBeInTheDocument();
    });

    it('should apply correct styling for assistant messages', () => {
      const { container } = render(<ChatMessage message={mockAssistantMessage} />);
      const messageContainer = container.querySelector('.justify-start');
      expect(messageContainer).toBeInTheDocument();
    });

    it('should render markdown bold text correctly', () => {
      const { container } = render(<ChatMessage message={mockAssistantMessage} />);
      const boldElements = container.querySelectorAll('strong');
      expect(boldElements.length).toBeGreaterThan(0);
    });
  });

  describe('Escalation Messages', () => {
    it('should render escalation badge when isEscalation is true', () => {
      render(<ChatMessage message={mockEscalationMessage} />);
      expect(screen.getByText('Escalation Requested')).toBeInTheDocument();
    });

    it('should render escalation icon', () => {
      const { container } = render(<ChatMessage message={mockEscalationMessage} />);
      const escalationBadge = screen.getByText('Escalation Requested').closest('div');
      expect(escalationBadge).toHaveClass('text-amber-600');
    });

    it('should not render escalation badge for non-escalation messages', () => {
      render(<ChatMessage message={mockAssistantMessage} />);
      expect(screen.queryByText('Escalation Requested')).not.toBeInTheDocument();
    });

    it('should render both escalation badge and message content', () => {
      render(<ChatMessage message={mockEscalationMessage} />);
      expect(screen.getByText('Escalation Requested')).toBeInTheDocument();
      expect(screen.getByText(/flagged this conversation/)).toBeInTheDocument();
    });
  });

  describe('Timestamp Formatting', () => {
    it('should format timestamp in 12-hour format', () => {
      const morningMessage: Message = {
        ...mockUserMessage,
        timestamp: new Date('2024-01-01T09:30:00'),
      };
      render(<ChatMessage message={morningMessage} />);
      expect(screen.getByText('09:30 AM')).toBeInTheDocument();
    });

    it('should format afternoon timestamp correctly', () => {
      const afternoonMessage: Message = {
        ...mockUserMessage,
        timestamp: new Date('2024-01-01T14:45:00'),
      };
      render(<ChatMessage message={afternoonMessage} />);
      expect(screen.getByText('02:45 PM')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper contrast for user messages', () => {
      const { container } = render(<ChatMessage message={mockUserMessage} />);
      const messageBubble = container.querySelector('.bg-blue-600');
      expect(messageBubble).toBeInTheDocument();
      expect(messageBubble).toHaveClass('text-white');
    });

    it('should have proper contrast for assistant messages', () => {
      const { container } = render(<ChatMessage message={mockAssistantMessage} />);
      const messageBubble = container.querySelector('.bg-white');
      expect(messageBubble).toBeInTheDocument();
    });
  });

  describe('Layout and Styling', () => {
    it('should apply correct max-width classes', () => {
      const { container } = render(<ChatMessage message={mockUserMessage} />);
      const maxWidthElement = container.querySelector('.max-w-\\[85\\%\\]');
      expect(maxWidthElement).toBeInTheDocument();
    });

    it('should have rounded corners for message bubble', () => {
      const { container } = render(<ChatMessage message={mockUserMessage} />);
      const messageBubble = container.querySelector('.rounded-2xl');
      expect(messageBubble).toBeInTheDocument();
    });

    it('should have proper spacing between elements', () => {
      const { container } = render(<ChatMessage message={mockUserMessage} />);
      const mainContainer = container.querySelector('.mb-6');
      expect(mainContainer).toBeInTheDocument();
    });
  });
});
