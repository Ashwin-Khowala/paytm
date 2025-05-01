"use client";
//wrong way to import
import {useBalance} from "../../../packages/store/src/hooks/useBalance"

export default function() {
  const balance = useBalance();
  return <div>
    hi there {balance}
  </div>
}