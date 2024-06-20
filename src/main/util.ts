/* eslint import/prefer-default-export: off */ 
import path from 'path';

export function resolveHtmlPath(htmlFileName: string) {
  let variablea= `file://${path.resolve(__dirname, '../renderer/', htmlFileName)}`
  console.log(variablea,'htmlfile')
  
  // if (process.env.NODE_ENV === 'development') {
  //   const port = process.env.PORT || 1212;
  //   const url = new URL(`http://localhost:${port}`);
  //   console.log(url,'url');
  //   //http://localhost:1212/
  //   url.pathname = htmlFileName;
  
  //   return url.href;
  // }

  return variablea
}
