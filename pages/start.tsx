const [sessionId] = useState(() => {
    return 'session-' + Date.now().toString(36) + Math.random().toString(36).slice(2);
  });
  