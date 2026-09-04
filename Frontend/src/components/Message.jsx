function Message({ message }) {
  if (!message) return null;
  return <p className="message">{message}</p>;
}

export default Message;