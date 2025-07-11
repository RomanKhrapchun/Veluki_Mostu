import Skeleton from "./Skeleton";
const SkeletonPage = () => {
    return (
        <div className="table-elements">
            <div className="table-header">
                    <Skeleton count={1} style={{height: '44px', width: '100%'}}/>
            </div>
            <div className="table-main">
                    <div style={{width: '100%'}}>
                        <Skeleton count={5} style={{height: '60px', marginBottom: '10px'}}/>
                    </div>
            </div>
        </div>
    );
};

export default SkeletonPage;