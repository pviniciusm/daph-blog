class Return {
  public ok: boolean;
  public message: String;
  public data: any;
  public isException: boolean;

  success = (data: any, message?: String) => {
    this.data = data;
    this.message = message;

    this.ok = true;
    this.isException = false;

    return this;
  };

  error = (message?: String) => {
    this.data = null;
    this.message = message;

    this.ok = false;
    this.isException = false;

    return this;
  };

  exception = (message?: String) => {
    this.data = null;
    this.message = message;

    this.ok = false;
    this.isException = false;

    return this;
  };

  get = () => {
    return {
      data: this.data,
      message: this.message,
      ok: this.ok,
      exception: this.isException,
    };
  };
}

export default Return;
