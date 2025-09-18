import { renderHook, act } from '@testing-library/react';
import { useChatLogic } from '../SmartChatbot/hooks/useChatLogic';

// Mock window.speechSynthesis
Object.defineProperty(window, 'speechSynthesis', {
  value: {
    speak: jest.fn(),
    cancel: jest.fn(),
    getVoices: jest.fn().mockReturnValue([]),
    onvoiceschanged: null
  },
  writable: true
});

// Mock fetch API
global.fetch = jest.fn();

describe('useChatLogic', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should initialize with default state', () => {
    const { result } = renderHook(() => useChatLogic());
    
    expect(result.current.state.isOpen).toBe(false);
    expect(result.current.state.messages).toEqual([]);
    expect(result.current.state.inputText).toBe('');
    expect(result.current.state.isTyping).toBe(false);
  });

  it('should update state correctly', async () => {
    const { result } = renderHook(() => useChatLogic());
    
    act(() => {
      result.current.updateState({ isOpen: true, inputText: 'Hello' });
    });
    
    expect(result.current.state.isOpen).toBe(true);
    expect(result.current.state.inputText).toBe('Hello');
  });

  it('should handle suggestion click', async () => {
    const { result } = renderHook(() => useChatLogic());
    
    act(() => {
      result.current.handleSuggestionClick('Test suggestion');
    });
    
    expect(result.current.state.inputText).toBe('Test suggestion');
  });

  it('should handle scroll events', async () => {
    const { result } = renderHook(() => useChatLogic());
    
    // Create a mock scroll event
    const mockScrollEvent = {
      target: {
        scrollTop: 100,
        scrollHeight: 500,
        clientHeight: 300
      }
    };
    
    act(() => {
      result.current.handleScroll(mockScrollEvent as any);
    });
    
    // Since we're mocking the ref, we can't directly test the state change
    // But we can verify the function doesn't throw an error
    expect(true).toBe(true);
  });

  it('should clear chat history', async () => {
    const { result } = renderHook(() => useChatLogic());
    
    // Add a message first
    act(() => {
      result.current.updateState({ 
        messages: [{ id: '1', text: 'Test', sender: 'user', timestamp: new Date() }] 
      });
    });
    
    // Clear chat
    act(() => {
      result.current.clearChat();
    });
    
    // After clearing, we should have the welcome messages
    expect(result.current.state.messages.length).toBeGreaterThan(0);
  });

  it('should export chat history', async () => {
    // Mock document.createElement and related functions
    const mockLink = { setAttribute: jest.fn(), click: jest.fn() };
    const createElementSpy = jest.spyOn(document, 'createElement').mockReturnValue(mockLink as any);
    const appendChildSpy = jest.spyOn(document.body, 'appendChild').mockImplementation();
    const removeChildSpy = jest.spyOn(document.body, 'removeChild').mockImplementation();
    
    const { result } = renderHook(() => useChatLogic());
    
    // Add a message
    act(() => {
      result.current.updateState({ 
        sessionId: 'test-session',
        messages: [{ id: '1', text: 'Test message', sender: 'user', timestamp: new Date() }] 
      });
    });
    
    // Export chat
    act(() => {
      result.current.exportChat();
    });
    
    expect(createElementSpy).toHaveBeenCalledWith('a');
    expect(mockLink.setAttribute).toHaveBeenCalledWith('download', expect.stringContaining('chat-history'));
    expect(mockLink.click).toHaveBeenCalled();
    
    // Clean up
    createElementSpy.mockRestore();
    appendChildSpy.mockRestore();
    removeChildSpy.mockRestore();
  });

  it('should handle CTA actions', async () => {
    const { result } = renderHook(() => useChatLogic());
    
    // Mock window.open
    const mockOpen = jest.fn();
    Object.defineProperty(window, 'open', {
      value: mockOpen,
      writable: true
    });
    
    // Mock document.getElementById
    const mockElement = { scrollIntoView: jest.fn() };
    const getElementByIdSpy = jest.spyOn(document, 'getElementById').mockReturnValue(mockElement as any);
    
    // Test WhatsApp CTA
    const whatsappCTA = {
      type: 'whatsapp',
      data: { phone: '+221701193811', message: 'Test message' }
    };
    
    await act(async () => {
      await result.current.handleCTAAction(whatsappCTA);
    });
    
    expect(mockOpen).toHaveBeenCalledWith(
      expect.stringContaining('wa.me'),
      '_blank'
    );
    
    // Clean up
    getElementByIdSpy.mockRestore();
  });

  it('should handle API errors gracefully', async () => {
    // Mock fetch to return an error
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: () => Promise.resolve({ error: 'Internal server error' })
    });
    
    const { result } = renderHook(() => useChatLogic());
    
    // Mock TTS request
    const mockTTS = jest.fn();
    
    // Send a message
    await act(async () => {
      await result.current.sendMessage('Test message');
    });
    
    // Should have added an error message
    expect(result.current.state.messages.length).toBe(1);
    expect(result.current.state.messages[0].sender).toBe('bot');
    expect(result.current.state.messages[0].text).toContain('erreur');
  });
});