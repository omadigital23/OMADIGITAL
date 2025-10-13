import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import { SmartChatbotNext } from '../SmartChatbotNext';

describe('SmartChatbotNext', () => {
  it('should render without crashing', () => {
    render(<SmartChatbotNext />);
    expect(true).toBe(true);
  });
});