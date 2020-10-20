import Return from './Return';

class Success extends Return {
  constructor (data: any, message?: String, code?: Number) {
    super(true, code || 200, message || 'Operação realizada com sucesso.', data, false);
  }
}

export default Success;
