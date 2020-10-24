class Return {
  public ok: boolean;
  public message: String;
  public data: any;
  public isException: boolean;
  public code: Number;
  public identifier: String;

  constructor (ok: boolean, code: Number, message: String, data?: any, isException?: boolean, identifier?: String) {
    this.data = data || undefined;
    this.message = message;
    this.ok = ok;
    this.code = code;
    this.isException = isException || false;
    this.identifier = identifier;
  }

  get = () => {
    return {
      data: this.data,
      message: this.message,
      ok: this.ok,
      exception: this.isException,
      identifier: this.identifier
    };
  };
}

export default Return;
