const message = document.querySelector('#build-message');

const deployedAt = new Date().toLocaleString(undefined, {
  dateStyle: 'medium',
  timeStyle: 'short'
});

message.textContent = `Website loaded successfully from Kubernetes. Browser time: ${deployedAt}`;
