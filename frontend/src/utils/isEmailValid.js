export default function isEmailValid(email) {
  const re = /^[^ ]+@[^ ]+\.[a-z]{2,6}$/;

  return re.test(email);
}