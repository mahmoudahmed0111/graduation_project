import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '@/store/authStore';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { 
  Send,
  Bot,
  User,
  Loader2,
  Sparkles,
  Paperclip,
  File,
  X
} from 'lucide-react';
import { useToastStore } from '@/store/toastStore';
import { formatFileSize } from '@/utils/formatters';
import { logger } from '@/lib/logger';

interface Attachment {
  id: string;
  file: File;
  preview?: string;
  type: 'image' | 'file';
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  attachments?: Attachment[];
}

export function Chatbot() {
  const { t } = useTranslation();
  useAuthStore();
  const { error: showError } = useToastStore();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      role: 'assistant',
      content: t('shared.chatbot.welcomeMessage'),
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    files.forEach(file => {
      const attachment: Attachment = {
        id: Date.now().toString() + Math.random(),
        file,
        type: file.type.startsWith('image/') ? 'image' : 'file',
      };

      // Create preview for images
      if (attachment.type === 'image') {
        const reader = new FileReader();
        reader.onload = (e) => {
          attachment.preview = e.target?.result as string;
          setAttachments(prev => [...prev, attachment]);
        };
        reader.readAsDataURL(file);
      } else {
        setAttachments(prev => [...prev, attachment]);
      }
    });

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemoveAttachment = (id: string) => {
    setAttachments(prev => prev.filter(att => att.id !== id));
  };

  const handleSend = async () => {
    if ((!input.trim() && attachments.length === 0) || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim() || (attachments.length > 0 ? t('shared.chatbot.attachmentLabel') : ''),
      timestamp: new Date(),
      attachments: [...attachments],
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setAttachments([]);
    setIsLoading(true);

    try {
      // Simulate API call to chatbot
      const response = await simulateChatbotResponse(userMessage.content);
      
      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      logger.error('Failed to get chatbot response', {
        context: 'Chatbot',
        error,
      });
      showError(t('shared.chatbot.failedResponse'));

      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: t('shared.chatbot.errorReply'),
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  const simulateChatbotResponse = async (question: string): Promise<string> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000));

    const lowerQuestion = question.toLowerCase();

    // Personal queries (would fetch from database in real implementation)
    if (lowerQuestion.includes('grade') || lowerQuestion.includes('score')) {
      if (lowerQuestion.includes('cs101') || lowerQuestion.includes('introduction to programming')) {
        return t('shared.chatbot.replyGradeCs101');
      }
      if (lowerQuestion.includes('cs201') || lowerQuestion.includes('data structures')) {
        return t('shared.chatbot.replyGradeCs201');
      }
      return t('shared.chatbot.replyGradeGeneric');
    }

    if (lowerQuestion.includes('attendance') || lowerQuestion.includes('present')) {
      return t('shared.chatbot.replyAttendance');
    }

    if (lowerQuestion.includes('gpa') || lowerQuestion.includes('cgpa') || lowerQuestion.includes('grade point')) {
      return t('shared.chatbot.replyGpa');
    }

    if (lowerQuestion.includes('schedule') || lowerQuestion.includes('class time') || lowerQuestion.includes('when is')) {
      return t('shared.chatbot.replySchedule');
    }

    if (lowerQuestion.includes('course') && (lowerQuestion.includes('enroll') || lowerQuestion.includes('register'))) {
      return t('shared.chatbot.replyEnroll');
    }

    if (lowerQuestion.includes('assignment') || lowerQuestion.includes('homework') || lowerQuestion.includes('due')) {
      return t('shared.chatbot.replyAssignments');
    }

    // General queries
    if (lowerQuestion.includes('library') || lowerQuestion.includes('book')) {
      return t('shared.chatbot.replyLibrary');
    }

    if (lowerQuestion.includes('policy') || lowerQuestion.includes('rule') || lowerQuestion.includes('regulation')) {
      return t('shared.chatbot.replyPolicy');
    }

    if (lowerQuestion.includes('hello') || lowerQuestion.includes('hi') || lowerQuestion.includes('hey')) {
      return t('shared.chatbot.replyHello');
    }

    // Default response
    return t('shared.chatbot.replyDefault', { question });
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="space-y-6 h-full flex flex-col">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">{t('nav.chatbot')}</h1>
        <p className="text-gray-600 mt-1">{t('shared.chatbot.subtitle')}</p>
      </div>

      {/* Chat Container */}
      <Card className="flex-1 flex flex-col min-h-[600px]">
        <CardHeader className="border-b border-gray-200 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary-100 rounded-lg">
              <Bot className="h-6 w-6 text-primary-600" />
            </div>
            <div>
              <CardTitle className="text-lg">{t('shared.chatbot.assistantName')}</CardTitle>
              <p className="text-sm text-gray-600">{t('shared.chatbot.alwaysHere')}</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col p-0">
          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                {message.role === 'assistant' && (
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center">
                    <Bot className="h-5 w-5 text-primary-600" />
                  </div>
                )}
                <div
                  className={`max-w-[80%] rounded-lg p-4 ${
                    message.role === 'user'
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-100 text-gray-900'
                  }`}
                >
                  {message.content && (
                    <p className="whitespace-pre-wrap text-sm leading-relaxed">
                      {message.content}
                    </p>
                  )}
                  
                  {/* Attachments */}
                  {message.attachments && message.attachments.length > 0 && (
                    <div className={`mt-3 space-y-2 ${message.role === 'user' ? '' : ''}`}>
                      {message.attachments.map((attachment) => (
                        <div
                          key={attachment.id}
                          className={`rounded-lg overflow-hidden ${
                            message.role === 'user'
                              ? 'bg-primary-500/20 border border-primary-400/30'
                              : 'bg-white border border-gray-200'
                          }`}
                        >
                          {attachment.type === 'image' && attachment.preview ? (
                            <div className="relative">
                              <img
                                src={attachment.preview}
                                alt={attachment.file.name}
                                className="max-w-full max-h-64 object-contain"
                              />
                              <div className={`p-2 ${message.role === 'user' ? 'text-primary-100' : 'text-gray-700'}`}>
                                <p className="text-xs font-medium truncate">{attachment.file.name}</p>
                                <p className="text-xs opacity-75">{formatFileSize(attachment.file.size)}</p>
                              </div>
                            </div>
                          ) : (
                            <div className={`p-3 flex items-center gap-3 ${message.role === 'user' ? 'text-primary-100' : 'text-gray-700'}`}>
                              <div className={`p-2 rounded-lg ${message.role === 'user' ? 'bg-primary-500/30' : 'bg-gray-100'}`}>
                                <File className="h-5 w-5" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-medium truncate">{attachment.file.name}</p>
                                <p className="text-xs opacity-75">{formatFileSize(attachment.file.size)}</p>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                  
                  <p
                    className={`text-xs mt-2 ${
                      message.role === 'user'
                        ? 'text-primary-100'
                        : 'text-gray-500'
                    }`}
                  >
                    {message.timestamp.toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
                {message.role === 'user' && (
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                    <User className="h-5 w-5 text-gray-600" />
                  </div>
                )}
              </div>
            ))}
            
            {isLoading && (
              <div className="flex gap-3 justify-start">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center">
                  <Bot className="h-5 w-5 text-primary-600" />
                </div>
                <div className="bg-gray-100 rounded-lg p-4">
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin text-gray-600" />
                    <span className="text-sm text-gray-600">{t('shared.chatbot.thinking')}</span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Attachments Preview */}
          {attachments.length > 0 && (
            <div className="border-t border-gray-200 p-4 bg-gray-50">
              <div className="flex flex-wrap gap-2">
                {attachments.map((attachment) => (
                  <div
                    key={attachment.id}
                    className="relative group bg-white border border-gray-200 rounded-lg overflow-hidden"
                  >
                    {attachment.type === 'image' && attachment.preview ? (
                      <div className="relative">
                        <img
                          src={attachment.preview}
                          alt={attachment.file.name}
                          className="w-20 h-20 object-cover"
                        />
                        <button
                          onClick={() => handleRemoveAttachment(attachment.id)}
                          className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ) : (
                      <div className="p-3 flex items-center gap-2 min-w-[120px]">
                        <div className="p-2 bg-gray-100 rounded">
                          <File className="h-4 w-4 text-gray-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium truncate">{attachment.file.name}</p>
                          <p className="text-xs text-gray-500">{formatFileSize(attachment.file.size)}</p>
                        </div>
                        <button
                          onClick={() => handleRemoveAttachment(attachment.id)}
                          className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Input Area */}
          <div className="border-t border-gray-200 p-4">
            <div className="flex gap-2">
              {/* Hidden file input */}
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*,.pdf,.doc,.docx,.txt"
                onChange={handleFileSelect}
                className="hidden"
              />
              
              {/* Attach button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={isLoading}
                className="px-3"
                title={t('shared.chatbot.attachTitle')}
              >
                <Paperclip className="h-5 w-5 text-gray-600" />
              </Button>
              
              <Input
                ref={inputRef}
                type="text"
                placeholder={t('shared.chatbot.inputPlaceholder')}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={isLoading}
                className="flex-1"
              />
              <Button
                variant="primary"
                onClick={handleSend}
                disabled={(!input.trim() && attachments.length === 0) || isLoading}
                className="px-6"
              >
                {isLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <>
                    <Send className="h-5 w-5 mr-2" />
                    {t('shared.chatbot.send')}
                  </>
                )}
              </Button>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              {t('shared.chatbot.helperHint')}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Quick Suggestions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        <button
          onClick={() => setInput(t('shared.chatbot.suggestGradeQuery'))}
          className="text-left p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-sm"
          disabled={isLoading}
        >
          <Sparkles className="h-4 w-4 text-primary-600 mb-1" />
          <p className="font-medium text-gray-900">{t('shared.chatbot.checkGrades')}</p>
          <p className="text-xs text-gray-600">{t('shared.chatbot.viewCourseGrades')}</p>
        </button>
        <button
          onClick={() => setInput(t('shared.chatbot.suggestAttendanceQuery'))}
          className="text-left p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-sm"
          disabled={isLoading}
        >
          <Sparkles className="h-4 w-4 text-primary-600 mb-1" />
          <p className="font-medium text-gray-900">{t('shared.chatbot.attendance')}</p>
          <p className="text-xs text-gray-600">{t('shared.chatbot.checkAttendance')}</p>
        </button>
        <button
          onClick={() => setInput(t('shared.chatbot.suggestScheduleQuery'))}
          className="text-left p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-sm"
          disabled={isLoading}
        >
          <Sparkles className="h-4 w-4 text-primary-600 mb-1" />
          <p className="font-medium text-gray-900">{t('shared.chatbot.schedule')}</p>
          <p className="text-xs text-gray-600">{t('shared.chatbot.viewClassTimes')}</p>
        </button>
        <button
          onClick={() => setInput(t('shared.chatbot.suggestGpaQuery'))}
          className="text-left p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-sm"
          disabled={isLoading}
        >
          <Sparkles className="h-4 w-4 text-primary-600 mb-1" />
          <p className="font-medium text-gray-900">{t('shared.chatbot.gpa')}</p>
          <p className="text-xs text-gray-600">{t('shared.chatbot.academicStanding')}</p>
        </button>
      </div>
    </div>
  );
}

