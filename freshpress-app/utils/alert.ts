export function showAlert(title: string, message: string, buttons?: any[]): void {
  if (typeof window !== 'undefined' && window.alert) {
    if (buttons) {
      // On web, just show a confirm dialog for the first cancel/OK
      const ok = window.confirm(`${title}\n\n${message}`);
      if (ok && buttons.length > 1) {
        buttons[1].onPress?.();
      } else if (!ok && buttons[0]?.onPress) {
        buttons[0].onPress?.();
      }
    } else {
      window.alert(`${title}\n\n${message}`);
    }
  } else {
    const { Alert } = require('react-native');
    Alert.alert(title, message, buttons);
  }
}
