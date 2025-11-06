import axios from 'axios';

(async ()=>{
  try{
    const res = await axios.post('http://localhost:2000/api/auth/login',{email:'admin@gmail.com', password:'admin'}, {timeout:5000});
    console.log('status', res.status);
    console.log(res.data);
  }catch(err){
    if(err.response){
      console.log('response error', err.response.status, err.response.data);
    } else {
      console.log('request error', err.message);
    }
  }
})();