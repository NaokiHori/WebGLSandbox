function throwUniformNotFoundException(uniformName: string): never {
  throw new Error(`Uniform ${uniformName} is not found`);
}

function throwInvalidNumberOfItemsException(nitems: number): never {
  throw new Error(
    `Invalid number of items to register as a uniform: ${nitems.toString()}`,
  );
}

function throwUnsupportedDataTypeException(dataType: string): never {
  throw new Error(`Unsupported data type: ${dataType}`);
}

export function setUniform({
  gl,
  program,
  dataType,
  uniformName,
  data,
}: {
  gl: WebGLRenderingContext | WebGL2RenderingContext;
  program: WebGLProgram;
  dataType: "FLOAT32" | "INT32" | "UNSUPPORTED";
  uniformName: string;
  data: number[];
}) {
  const location: WebGLUniformLocation | null = gl.getUniformLocation(
    program,
    uniformName,
  );
  if (location === null) {
    throwUniformNotFoundException(uniformName);
  }
  const nitems: number = data.length;
  if (dataType === "FLOAT32") {
    const typedData = new Float32Array(data);
    if (nitems === 1) {
      gl.uniform1fv(location, typedData);
    } else if (nitems === 2) {
      gl.uniform2fv(location, typedData);
    } else if (nitems === 3) {
      gl.uniform3fv(location, typedData);
    } else if (nitems === 4) {
      gl.uniform4fv(location, typedData);
    } else {
      throwInvalidNumberOfItemsException(nitems);
    }
  } else if (dataType === "INT32") {
    const typedData = new Int32Array(data);
    if (nitems === 1) {
      gl.uniform1iv(location, typedData);
    } else if (nitems === 2) {
      gl.uniform2iv(location, typedData);
    } else if (nitems === 3) {
      gl.uniform3iv(location, typedData);
    } else if (nitems === 4) {
      gl.uniform4iv(location, typedData);
    } else {
      throwInvalidNumberOfItemsException(nitems);
    }
  } else {
    throwUnsupportedDataTypeException(dataType);
  }
}

export function setUniformMatrix({
  gl,
  program,
  uniformName,
  data,
}: {
  gl: WebGLRenderingContext | WebGL2RenderingContext;
  program: WebGLProgram;
  uniformName: string;
  data: number[];
}) {
  const location: WebGLUniformLocation | null = gl.getUniformLocation(
    program,
    uniformName,
  );
  if (location === null) {
    throwUniformNotFoundException(uniformName);
  }
  const nitems: number = data.length;
  const typedData = new Float32Array(data);
  if (nitems === 4) {
    gl.uniformMatrix2fv(location, false, typedData);
  } else if (nitems === 9) {
    gl.uniformMatrix3fv(location, false, typedData);
  } else if (nitems === 16) {
    gl.uniformMatrix4fv(location, false, typedData);
  } else {
    throwInvalidNumberOfItemsException(nitems);
  }
}
