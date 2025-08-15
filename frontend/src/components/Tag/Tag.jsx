/**
 * Tag Component
 * Displays a label with a close icon (✖️).
 * 
 * Props:
 * - text: Text to display inside the tag.
 * - onClick: Function called when the tag is clicked.
 * - color: (Optional) Not used directly, can be styled via CSS.
 */

import "./tag.css";

export default function Tag({ text, onClick, color }) {
	return (
		<div className="tag" onClick={onClick}>
			<p onClick={onClick}>{text} ✖️</p>
		</div>
	);
}
