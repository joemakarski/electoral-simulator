from .plurality import Plurality
from .listpr import OpenListProportionalRepresentation
from .mmp import MixedMemberProportionalRepresentation
from .stv import SingleTransferableVote

SYSTEM_REGISTRY = {
    'plurality': Plurality(),
    'listpr': OpenListProportionalRepresentation(),
    'mmp': MixedMemberProportionalRepresentation(),
    'stv': SingleTransferableVote(),
}
