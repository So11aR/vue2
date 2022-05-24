export default {
	resetCheckbox(checkboxes) {
		checkboxes.forEach((checkbox) => (checkbox.checked = false));
	},
	resetCheckboxAll(checkbox) {
		checkbox && (checkbox.checked = false);
	},
	sortedByDesc(a, b) {
		return b.updatedate - a.updatedate
	},
	sortedByAsc(a, b) {
		return a.updatedate - b.updatedate
	},
}