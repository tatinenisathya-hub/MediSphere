function Header({ title, description }) {
  return (
    <header className="header">
      <h1>{title}</h1>
      <p>{description}</p>
    </header>
  );
}

export default Header;