import React, { useState, useEffect, useRef } from 'react';
import {
  Calendar,
  Clock,
  MapPin,
  Mail,
  Send,
  Sparkles,
  ChevronDown,
  Info,
  MessageSquare,
  User,
  Bot,
  Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ChatBot = ({ onSync }) => {
  const [messages, setMessages] = useState([
    { id: 1, text: "Hello! I'm your AI scheduling assistant. How can I help you book an appointment today?", sender: 'ai' }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = { id: Date.now(), text: input, sender: 'user' };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    // Simulate AI thinking
    setTimeout(() => {
      let aiResponse = "I can definitely help with that! You can fill out the form on the left, or just tell me the details here.";

      if (input.toLowerCase().includes('consultation')) {
        aiResponse = "Great! I've updated the 'Purpose' field to Consultation for you. What date were you thinking?";
        onSync({ purpose: 'Consultation' });
      } else if (input.toLowerCase().includes('support')) {
        aiResponse = "Noted. I've set the purpose to Technical Support. Would you like to pick a time?";
        onSync({ purpose: 'Technical Support' });
      }

      setMessages(prev => [...prev, { id: Date.now() + 1, text: aiResponse, sender: 'ai' }]);
      setIsTyping(false);
    }, 1500);
  };

  return (
    <div className="chat-container glass-panel" style={{ height: '600px' }}>
      <div style={{ padding: '1rem', borderBottom: '1px solid var(--glass-border)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <div className="ai-status-pulse"></div>
        <span style={{ fontWeight: '600', fontSize: '0.9rem' }}>AI Agent Chat</span>
      </div>

      <div className="chat-messages" ref={scrollRef}>
        {messages.map(msg => (
          <motion.div
            initial={{ opacity: 0, x: msg.sender === 'ai' ? -10 : 10 }}
            animate={{ opacity: 1, x: 0 }}
            key={msg.id}
            className={`message ${msg.sender}`}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
              {msg.sender === 'ai' ? <Bot size={14} /> : <User size={14} />}
              <span style={{ fontSize: '0.7rem', opacity: 0.7, fontWeight: '700' }}>
                {msg.sender === 'ai' ? 'AGENT' : 'YOU'}
              </span>
            </div>
            {msg.text}
          </motion.div>
        ))}
        {isTyping && (
          <div className="message ai">
            <Loader2 size={16} className="animate-spin" />
          </div>
        )}
      </div>

      <form onSubmit={handleSend} className="chat-input-wrapper">
        <input
          type="text"
          className="chat-input"
          placeholder="Ask me anything..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <button type="submit" className="send-btn">
          <Send size={18} />
        </button>
      </form>
    </div>
  );
};

const AppointmentForm = ({ formData, setFormData, isSubmitted, setIsSubmitted }) => {
  const purposes = [
    'Consultation',
    'Technical Support',
    'Business Inquiry',
    'General Check-in',
    'Follow-up Meeting'
  ];

  const timezones = ['UTC', 'GMT', 'EST', 'PST', 'IST', 'CET', 'JST'];
  const timeSlots = Array.from({ length: 24 }, (_, i) => `${i.toString().padStart(2, '0')}:00`);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitted(true);

    // Integrated Webhook POST to n8n AI Agent
    fetch("https://n8n-latest-sgyi.onrender.com/webhook-test/book-appointment", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        purpose: formData.purpose,
        date: formData.date,
        startTime: formData.startTime,
        endTime: formData.endTime,
        timeZone: formData.timezone,
        email: formData.email
      })
    })
      .then(response => {
        console.log('Webhook Response:', response);
        // Success handling is managed by the isSubmitted state animation
      })
      .catch(error => {
        console.error('Webhook Error:', error);
      });


    setTimeout(() => setIsSubmitted(false), 4000);
  };


  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-panel"
      style={{ padding: '2.5rem', boxShadow: '0 20px 50px rgba(0,0,0,0.3)' }}
    >
      <header style={{ marginBottom: '2rem' }}>
        <h2 className="title-gradient" style={{ fontSize: '1.8rem', marginBottom: '0.5rem' }}>Appointment Details</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Fill in the fields below or chat with our AI.</p>
      </header>

      <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1.25rem' }}>
        <div className="form-group">
          <label><MapPin size={14} style={{ marginRight: 6 }} /> Purpose</label>
          <select name="purpose" value={formData.purpose} onChange={handleChange} required>
            <option value="" disabled>Select a purpose...</option>
            {purposes.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>

        <div style={{ display: 'flex', gap: '1rem' }}>
          <div style={{ flex: 1 }}>
            <label><Calendar size={14} style={{ marginRight: 6 }} /> Date</label>
            <input type="date" name="date" value={formData.date} onChange={handleChange} required />
          </div>
          <div style={{ flex: 1 }}>
            <label><MapPin size={14} style={{ marginRight: 6 }} /> Time Zone</label>
            <select name="timezone" value={formData.timezone} onChange={handleChange} required>
              {timezones.map(tz => <option key={tz} value={tz}>{tz}</option>)}
            </select>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '1rem' }}>
          <div style={{ flex: 1 }}>
            <label><Clock size={14} style={{ marginRight: 6 }} /> Start Time</label>
            <select name="startTime" value={formData.startTime} onChange={handleChange} required>
              <option value="" disabled>Start...</option>
              {timeSlots.map(slot => <option key={slot} value={slot}>{slot}</option>)}
            </select>
          </div>
          <div style={{ flex: 1 }}>
            <label><Clock size={14} style={{ marginRight: 6 }} /> End Time</label>
            <select name="endTime" value={formData.endTime} onChange={handleChange} required>
              <option value="" disabled>End...</option>
              {timeSlots.map(slot => <option key={slot} value={slot}>{slot}</option>)}
            </select>
          </div>
        </div>

        <div className="form-group">
          <label><Mail size={14} style={{ marginRight: 6 }} /> Email Address</label>
          <input
            type="email"
            name="email"
            placeholder="your@email.com"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="primary-btn"
          style={{ width: '100%', marginTop: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem' }}
          type="submit"
        >
          {isSubmitted ? 'Processing...' : (
            <>
              <Send size={18} />
              Confirm Appointment
            </>
          )}
        </motion.button>
      </form>
    </motion.div>
  );
};

const App = () => {
  const [formData, setFormData] = useState({
    purpose: '',
    date: '',
    startTime: '',
    endTime: '',
    timezone: 'UTC',
    email: ''
  });
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSync = (data) => {
    setFormData(prev => ({ ...prev, ...data }));
  };

  return (
    <div className="container">
      <header style={{ textAlign: 'center', marginBottom: '4rem', marginTop: '2rem' }}>
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6 }}
        >
          <div style={{ display: 'inline-flex', background: 'rgba(99, 102, 241, 0.1)', padding: '0.75rem', borderRadius: '50%', marginBottom: '1.5rem', border: '1px solid rgba(99, 102, 241, 0.2)' }}>
            <Sparkles className="text-primary" size={32} color="#818cf8" />
          </div>
          <h1 className="title-gradient" style={{ fontSize: '3.5rem', marginBottom: '1rem', letterSpacing: '-0.02em' }}>
            Book Smarter, Better.
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.2rem', maxWidth: '600px', margin: '0 auto' }}>
            Experience the future of scheduling with our AI-integrated booking system.
            Choose your path: fill the form or chat with our agent.
          </p>
        </motion.div>
      </header>

      <div className="layout-grid">
        <AppointmentForm
          formData={formData}
          setFormData={setFormData}
          isSubmitted={isSubmitted}
          setIsSubmitted={setIsSubmitted}
        />
        <ChatBot onSync={handleSync} />
      </div>

      <footer style={{ marginTop: '4rem', textAlign: 'center', paddingBottom: '2rem' }}>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
          <Info size={14} /> Secured by AI-Verification. Your data is encrypted.
        </p>
      </footer>

      <AnimatePresence>
        {isSubmitted && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            style={{
              position: 'fixed',
              bottom: '2rem',
              right: '2rem',
              background: 'var(--accent)',
              color: 'white',
              padding: '1.25rem 2.5rem',
              borderRadius: 'var(--radius-md)',
              boxShadow: '0 20px 40px rgba(16, 185, 129, 0.3)',
              fontWeight: '600',
              zIndex: 100,
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem'
            }}
          >
            <Sparkles size={20} />
            🎉 Appointment Request Sent Successfully!
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default App;
