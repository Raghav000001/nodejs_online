// function  ---- generate key (string || uuid)


import { v4 as uuidv4 } from 'uuid';

export const generateKey = () => {
     return uuidv4();   
}
