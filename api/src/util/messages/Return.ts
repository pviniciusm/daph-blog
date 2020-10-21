class Return {
  public ok: boolean;
  public message: String;
  public data: any;
  public isException: boolean;
  public code: Number;

  constructor (ok: boolean, code: Number, message: String, data?: any, isException?: boolean) {
    this.data = data || undefined;
    this.message = message;
    this.ok = ok;
    this.code = code;
    this.isException = isException || false;
  }

  get = () => {
    return {
      data: this.data,
      message: this.message,
      ok: this.ok,
      exception: this.isException
    };
  };
}

export default Return;
