import './index.css';
import c7n from '../assents/c7n.jpg';
var img = new Image();
img.src = c7n;
img.alt = 'c7n';
const target = document.getElementById('app');
target.append(img);