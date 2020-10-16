import Return from './Return';

class ApiReturn {
  static success (res: any, data: Return, code?: number) {
    return res.status(code || 200).send(data.get());
  }

  static exception (res: any, data: Return, code?: number) {
    return res.status(code || 500).send(data.get());
  }

  static failure (res: any, data: Return, code?: number) {
    return res.status(code || 400).send(data.get());
  }
}

export default ApiReturn;
