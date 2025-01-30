document.getElementById('hello-world')?.addEventListener('click', onHelloWorldClick);

function onHelloWorldClick() {
  // Update button text
  const button = document.getElementById('hello-world');
  if (button) {
    button.textContent = 'Clicked!';
  }
}
