
const EmptyCard = ({ imSrc, message }) => {
    return (
        <div className="flex flex-col items-center justify-center mt-20">

            <img src={imSrc} alt="No NOtes" className="w-60"/>

            <p className="w-1/2 text-sm font-medium text-slate-700 text-center leading-7 mt-5" >
            {message}
            </p>

        </div>
    )
}

export default EmptyCard;