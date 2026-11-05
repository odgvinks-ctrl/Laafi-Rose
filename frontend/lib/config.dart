class Config {
  static const apiBackend = String.fromEnvironment('API_URL', defaultValue: 'http://10.0.2.2:8000');
  static const apiIa = String.fromEnvironment('IA_URL', defaultValue: 'http://10.0.2.2:8001');
}
